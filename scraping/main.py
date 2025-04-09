import os
import time
import json
import random
import logging
import uuid
import psycopg2
import feedparser
from datetime import datetime
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse
from dotenv import load_dotenv
from textblob import TextBlob
from playwright.sync_api import Playwright, sync_playwright, TimeoutError as PlaywrightTimeoutError

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scraper.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("article_scraper")

load_dotenv()

NEON_DB_URL = os.environ["NEON_DB_URL"]

# News sources configuration
sources = [
    # Right-Leaning
    # {
    #     "url": "https://www.foxnews.com",
    #     "source": "Fox News",
    #     "community": "right"
    # },
    # Left-Leaning
    {
        "url": "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
        "source": "New York Times",
        "community": "left"
    }
]

# Selectors for different websites
selectors = {
    "www.foxnews.com": {
        "articles": "article.article[class*='story-']",
        "title": ".headline.speakable",
        "content": ".article-body p"
    },
    "rss.nytimes.com": {
        "rss": True,
        "url": "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
    }
}

# Social media platforms configuration
social_platforms = {
    "reddit": {
        "base_url": "https://www.reddit.com",
        "subreddits": ["politics", "worldnews", "conservative", "news"],
        "sort": ["hot", "new", "top"],
        "time": ["day", "week", "month"]
    },
    "twitter": {
        "base_url": "https://twitter.com",
        "accounts": ["CNN", "FoxNews", "BBCWorld", "Reuters", "AP"],
        "hashtags": ["news", "politics", "worldnews"]
    }
}

class ArticleScraper:
    def __init__(self, playwright: Playwright):
        self.playwright = playwright
        self.browser = None
        self.context = None
        self.page = None
        self.db_conn = None
        
        # Connect to Neon database
        try:
            self.db_conn = psycopg2.connect(NEON_DB_URL)
            logger.info("Connected to Neon database")
        except Exception as e:
            logger.error(f"Error connecting to Neon database: {str(e)}")
    
    def setup(self):
        """Initialize the browser session"""
        self.browser = self.playwright.chromium.launch(headless=True)
        self.context = self.browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        )
        self.page = self.context.new_page()
        logger.info("Browser session initialized")

    def teardown(self):
        """Close browser and session"""
        if self.context:
            self.context.close()
        if self.browser:
            self.browser.close()
        if self.db_conn:
            self.db_conn.close()
        logger.info("Browser session and database connection closed")
    
    def get_domain(self, url: str) -> str:
        """Extract domain from URL"""
        parsed_url = urlparse(url)
        return parsed_url.netloc
    
    def get_selectors(self, domain: str) -> Dict[str, Any]:
        """Get appropriate selectors for the domain"""
        # Return domain-specific selectors or empty dict if domain not found
        return selectors.get(domain, {})
    
    def random_delay(self, min_seconds: float = 1.0, max_seconds: float = 3.0):
        """Add random delay to avoid detection"""
        time.sleep(random.uniform(min_seconds, max_seconds))
    
    def analyze_sentiment(self, text: str) -> float:
        """Analyze sentiment of text and return a score between -1 and 1"""
        try:
            if not text or len(text) < 10:
                return 0.0
            analysis = TextBlob(text)
            return analysis.sentiment.polarity
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {str(e)}")
            return 0.0
    
    def get_title_from_url(self, url: str) -> str:
        """Extract a title from the URL when regular title extraction fails"""
        try:
            # Parse the URL
            parsed_url = urlparse(url)
            
            # Extract the path
            path = parsed_url.path
            
            # Remove trailing slash if present
            if path.endswith('/'):
                path = path[:-1]
                
            # Split by slashes and get the last part
            parts = path.split('/')
            last_part = parts[-1] if parts else ""
            
            # If the last part is empty, try the second last
            if not last_part and len(parts) > 1:
                last_part = parts[-2]
                
            # Remove file extension if present
            if '.' in last_part:
                last_part = last_part.split('.')[0]
                
            # Replace hyphens and underscores with spaces
            last_part = last_part.replace('-', ' ').replace('_', ' ')
            
            # Capitalize first letter of each word
            title = ' '.join(word.capitalize() for word in last_part.split())
            
            # If title is still empty, use domain name
            if not title:
                title = parsed_url.netloc.replace('www.', '')
                
            return title
        except Exception as e:
            logger.error(f"Error extracting title from URL: {str(e)}")
            return "Untitled Article"
    
    def scrape_article(self, url: str, source_name: str, community: str) -> Optional[Dict[str, Any]]:
        """Scrape a single article page and format as Perspective"""
        try:
            domain = self.get_domain(url)
            site_selectors = self.get_selectors(domain)
            
            logger.info(f"Scraping article: {url}")
            
            # Create a new page for each article to avoid connection issues
            article_page = self.context.new_page()
            try:
                article_page.goto(url, wait_until="networkidle", timeout=30000)
                self.random_delay()
                
                title = None
                title_element = article_page.query_selector(site_selectors["title"])
                if title_element:
                    title = title_element.text_content().strip()
                
                # If still no title, use page title or extract from URL
                if not title:
                    title = self.get_title_from_url(url)
                
                # Extract content text
                content_elements = article_page.query_selector_all(site_selectors["content"])
                content_text = " ".join([el.text_content().strip() for el in content_elements]) if content_elements else ""


                print(content_text)
                sentiment_score = self.analyze_sentiment(content_text)
                
                quote = content_elements[0].text_content().strip() if content_elements and len(content_elements) > 0 else ""
                
                article_url = url
            
                perspective = {
                    "id": str(uuid.uuid4()),
                    "title": title,
                    "source": source_name,
                    "community": community,
                    "quote": quote,
                    "sentiment": sentiment_score,
                    "url": article_url,
                    "date": datetime.now().isoformat(),
                    "scraped_at": datetime.now().isoformat()
                }
                
                return perspective
            finally:
                article_page.close()
                
        except PlaywrightTimeoutError:
            logger.error(f"Timeout while scraping {url}")
            return None
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            return None
    
    def scrape_rss_feed(self, url: str, source_name: str, community: str) -> List[Dict[str, Any]]:
        """Scrape articles from an RSS feed"""
        perspectives = []
        
        try:
            logger.info(f"Parsing RSS feed: {url}")
            feed = feedparser.parse(url)
            
            if not feed.entries:
                logger.warning(f"No entries found in RSS feed: {url}")
                return perspectives
                
            logger.info(f"Found {len(feed.entries)} entries in RSS feed")
            
            for i, entry in enumerate(feed.entries):
                try:
                    title = entry.title
                    link = entry.link
                    
                    # Extract content or summary
                    content = ""
                    if hasattr(entry, 'content') and entry.content:
                        content = entry.content[0].value
                    elif hasattr(entry, 'summary'):
                        content = entry.summary
                        
                    # Calculate sentiment using both title and content
                    combined_text = title + ". " + content if content else title
                    sentiment_score = self.analyze_sentiment(combined_text)
                    
                    # Extract a quote (first paragraph or sentence)
                    quote = content.split('.')[0] if content else ""
                    if len(quote) > 200:
                        quote = quote[:197] + "..."
                    
                    perspective = {
                        "id": str(uuid.uuid4()),
                        "title": title,
                        "source": source_name,
                        "community": community,
                        "quote": quote,
                        "sentiment": sentiment_score,
                        "url": link,
                        "scraped_at": datetime.now().isoformat()
                    }
                    
                    self.save_to_database(perspective)
                    perspectives.append(perspective)
                    logger.info(f"  Processed RSS entry {i+1}: {title[:50]}...")
                    
                except Exception as e:
                    logger.error(f"Error processing RSS entry: {str(e)}")
                    continue
                    
            return perspectives
            
        except Exception as e:
            logger.error(f"Error parsing RSS feed {url}: {str(e)}")
            return perspectives
    
    def save_to_database(self, perspective: Dict[str, Any]):
        """Save perspective to Neon database"""
        if not self.db_conn:
            logger.warning("Database connection not available, skipping save")
            return
            
        try:
            cursor = self.db_conn.cursor()
            
            
            # Insert perspective data
            cursor.execute("""
                INSERT INTO perspectives 
                (id, title, source, community, quote, sentiment, url, scraped_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                source = EXCLUDED.source,
                community = EXCLUDED.community,
                quote = EXCLUDED.quote,
                sentiment = EXCLUDED.sentiment,
                url = EXCLUDED.url,
                scraped_at = EXCLUDED.scraped_at
            """, (
                perspective["id"],
                perspective["title"],
                perspective["source"],
                perspective["community"],
                perspective["quote"],
                perspective["sentiment"],
                perspective["url"],
                perspective["scraped_at"]
            ))
            
            self.db_conn.commit()
            logger.info(f"Saved perspective to database: {perspective['id']}")
            
        except Exception as e:
            logger.error(f"Error saving to database: {str(e)}")
            self.db_conn.rollback()
    
    def scrape_news_site(self, source: Dict[str, str]) -> List[Dict[str, Any]]:
        """Scrape articles from a news website"""
        url = source["url"]
        source_name = source["source"]
        community = source["community"]
        domain = self.get_domain(url)
        site_selectors = self.get_selectors(domain)

        print(f"Extracted domain: {domain}")
        
        perspectives = []
        
        if site_selectors.get("rss", False):
            return self.scrape_rss_feed(url, source_name, community)
        
        try:
            logger.info(f"Visiting {url}")
            try:
                # Add retry logic for page navigation
                retries = 2
                for attempt in range(retries):
                    try:
                        self.page.goto(url, wait_until="domcontentloaded", timeout=45000)
                        break
                    except PlaywrightTimeoutError:
                        if attempt < retries - 1:
                            logger.warning(f"Timeout on attempt {attempt+1}, retrying...")
                            time.sleep(2)
                        else:
                            raise
            except Exception as e:
                logger.error(f"Failed to load {url}: {str(e)}")
                return perspectives
                
            self.random_delay(2.0, 4.0)
            
            # Find article links - use more specific selectors for each site
            article_selector = site_selectors.get("articles")
            print(article_selector)
            article_elements = self.page.query_selector_all(article_selector)
            article_links = []
            
            logger.info(f"Found {len(article_elements)} potential article elements on {source_name}")
            
            for i, element in enumerate(article_elements):  # Limit to first 10 articles
                try:
                    # Try to get href directly if element is an anchor
                    href = element.get_attribute("href")
                    
                    # If not an anchor, look for anchor inside
                    if not href:
                        link_element = element.query_selector("a")
                        if link_element:
                            href = link_element.get_attribute("href")
                    
                    if href:
                        # Handle relative URLs
                        if href.startswith("/"):
                            parsed_url = urlparse(url)
                            href = f"{parsed_url.scheme}://{parsed_url.netloc}{href}"
                        article_links.append(href)
                        
                        # Log article title if available
                        title_element = element.query_selector(site_selectors.get("title"))
                        if title_element:
                            title = title_element.text_content().strip()
                            if not title or len(title) < 5:
                                title = self.get_title_from_url(href)
                                logger.info(f"  Article {i+1}: {title[:50]}... (from URL) - {href}")
                            else:
                                logger.info(f"  Article {i+1}: {title[:50]}... - {href}")
                        else:
                            title = self.get_title_from_url(href)
                            logger.info(f"  Article {i+1}: {title[:50]}... (from URL) - {href}")
                except Exception as e:
                    logger.warning(f"Error extracting article link: {str(e)}")
                    continue
            
            logger.info(f"Successfully extracted {len(article_links)} article links from {source_name}")
            
            # Scrape each article
            for i, link in enumerate(article_links):  
                try:
                    logger.info(f"Scraping article {i+1}/{min(5, len(article_links))}: {link}")
                    perspective = self.scrape_article(link, source_name, community)
                    if perspective:
                        perspectives.append(perspective)
                        self.save_to_database(perspective)
                        logger.info(f"  Successfully scraped: {perspective['title'][:50]}...")
                    else:
                        logger.warning(f"  Failed to extract content from: {link}")
                    self.random_delay()
                except Exception as e:
                    logger.error(f"Error scraping article {link}: {str(e)}")
                    if not self.browser.is_connected():
                        logger.info("Browser disconnected, reconnecting...")
                        self.teardown()
                        self.setup()
                    continue
                    
        except PlaywrightTimeoutError:
            logger.error(f"Timeout while scraping {url}")
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            
        return perspectives
    
    
    def run(self):
        """Main execution method"""
        try:
            self.setup()
            
            # Scrape news sites
            for source in sources:
                try:
                    logger.info(f"Scraping {source['source']}")
                    self.scrape_news_site(source)
                    self.random_delay(3.0, 6.0)  # Longer delay between sites
                except Exception as e:
                    logger.error(f"Error processing {source['source']}: {str(e)}")
                    # Check if browser is still connected, if not, reconnect
                    if not self.browser.is_connected():
                        logger.info("Browser disconnected, reconnecting...")
                        self.teardown()
                        self.setup()
                    continue
            
            # Scrape Reddit
            # for subreddit in social_platforms["reddit"]["subreddits"]:
            #     try:
            #         logger.info(f"Scraping Reddit r/{subreddit}")
            #         self.scrape_reddit(subreddit)
            #         self.random_delay(3.0, 6.0)
            #     except Exception as e:
            #         logger.error(f"Error processing Reddit r/{subreddit}: {str(e)}")
            #         # Check if browser is still connected, if not, reconnect
            #         if not self.browser.is_connected():
            #             logger.info("Browser disconnected, reconnecting...")
            #             self.teardown()
            #             self.setup()
            #         continue
                    
        finally:
            self.teardown()


def run(playwright: Playwright) -> None:
    scraper = ArticleScraper(playwright)
    scraper.run()


if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
