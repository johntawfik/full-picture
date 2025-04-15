import os
import time
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
from bs4 import BeautifulSoup
import anthropic
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

sources = [
    {
        "url": "https://www.foxnews.com",
        "source": "Fox News",
        "community": "right"
    },
    {
        "url": "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
        "source": "New York Times",
        "community": "left"
    },
    {
        "url": "https://www.newsweek.com",
        "source": "Newsweek",
        "community": "left"
    },
    {
        "url": "https://www.nypost.com",
        "source": "New York Post",
        "community": "right"
    },
    {
        "url": "https://www.theguardian.com/uk/rss",
        "source": "The Guardian",
        "community": "left"
    },
    {
        "url": "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362",
        "source": "CNBC",
        "community": "center"
    },
    {
        "url": "https://feeds.content.dowjones.io/public/rss/RSSWorldNews",
        "source": "Wall Street Journal",
        "community": "right"
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
    },
    "www.theguardian.com": {
        "rss": True,
        "url": "https://www.theguardian.com/uk/rss"
    },
    "search.cnbc.com": {
        "rss": True,
        "url": "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362"
    },
    "feeds.content.dowjones.io": {
        "rss": True,
        "url": "https://feeds.content.dowjones.io/public/rss/RSSWorldNews"
    },
    "www.newsweek.com": {
        "articles": "article.article-card",
        "title": "header.article-header h1",
        "content": "div.article-body.article-real-content.v_text"
    },
    "www.nypost.com": {
        "articles": "div.story a[href*='/2025/']",
        "title": "h1.headline",
        "content": "div.single__content"
    },
     "nypost.com": {
        "articles": "div.story a[href*='/2025/']",
        "title": "h1.headline",
        "content": "div.single__content"
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
    
    def clean_html(self, html_content: str) -> str:
        """Remove HTML tags, script, and style elements from text."""
        try:
            if not html_content:
                return ""
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Remove script and style elements
            for script_or_style in soup(["script", "style"]):
                script_or_style.decompose() # Remove the tag
            
            # Get text
            text = soup.get_text()
            
            # Break into lines and remove leading/trailing space on each
            lines = (line.strip() for line in text.splitlines())
            # Break multi-headlines into a line each
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            # Drop blank lines
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            return text
        except Exception as e:
            logger.error(f"Error cleaning HTML: {str(e)}")
            return html_content # Return original content on error
    
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
        try:
            if self.context:
                self.context.close()
            if self.browser:
                self.browser.close()
            if self.db_conn:
                self.db_conn.close()
            logger.info("Browser session and database connection closed")
        except Exception as e:
            logger.error(f"Error during teardown: {str(e)}")
    
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
    
    def summarize_with_anthropic(self, content: str) -> str:
        """Summarize content using Anthropic's Claude API in a maximum of 3 sentences"""
        try:
            client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
            
            prompt = f"""Please summarize the following article content in a maximum of 3 sentences, focusing on the key points:

{content}

Summary:"""
            
            response = client.messages.create(
                model="claude-3-5-haiku-latest",
                max_tokens=150,
                temperature=0.3,
                system="You are a helpful assistant that summarizes news articles concisely.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            summary = response.content[0].text.strip()
            logger.info(f"Successfully generated summary of length: {len(summary)}")
            return summary
            
        except Exception as e:
            logger.error(f"Error summarizing with Anthropic: {str(e)}")
            return content 
    
    def scrape_article(self, url: str, source_name: str, community: str) -> Optional[Dict[str, Any]]:
        """Scrape a single article page and format as Perspective"""
        article_page = None
        try:
            # Validate URL
            if not url.startswith(('http://', 'https://')):
                logger.warning(f"Invalid URL format: {url}")
                return None
            
            domain = self.get_domain(url)
            site_selectors = self.get_selectors(domain)
            
            if not site_selectors:
                logger.warning(f"No selectors found for domain: {domain}")
                return None
            
            logger.info(f"Scraping article: {url}")
            
            # Create a new page for each article to avoid connection issues
            article_page = self.context.new_page()
            
            # Set a longer timeout and handle network errors
            try:
                article_page.goto(url, wait_until="domcontentloaded", timeout=60000)
                self.random_delay()
            except PlaywrightTimeoutError:
                logger.error(f"Timeout while loading {url}")
                return None
            except Exception as e:
                logger.error(f"Error loading {url}: {str(e)}")
                return None
            
            # Wait for content to be available
            try:
                article_page.wait_for_selector(site_selectors["title"], timeout=10000)
            except PlaywrightTimeoutError:
                logger.warning(f"Title selector not found for {url}")
            
            title = None
            title_element = article_page.query_selector(site_selectors["title"])
            if title_element:
                title = title_element.text_content().strip()
                logger.info(f"Found title: {title}")
            
            # If still no title, use page title or extract from URL
            if not title:
                title = self.get_title_from_url(url)
                logger.info(f"Using URL-based title: {title}")
            
            content_text = ""
            content_elements = []
            try:
                content_elements = article_page.query_selector_all(site_selectors["content"])
                if content_elements:
                    content_text = " ".join([el.text_content().strip() for el in content_elements])
                    logger.info(f"Found content length: {len(content_text)}")
                else:
                    logger.warning(f"No content elements found for {url}")
            except Exception as e:
                logger.error(f"Error extracting content: {str(e)}")
                return None
            
            content_text = self.clean_html(content_text)
            sentiment_score = self.analyze_sentiment(content_text)
            

            quote = self.summarize_with_anthropic(content_text)

            
            if not content_text:
                logger.warning(f"No content found for {url}, skipping")
                return None
            
            if domain == "www.newsweek.com":
                if title.split(" ")[-1].isnumeric():
                    title = title.split(" ")[:-1]
                    title = " ".join(title)
            
            perspective = {
                "id": str(uuid.uuid4()),
                "title": title,
                "source": source_name,
                "community": community,
                "quote": self.clean_html(quote),
                "sentiment": sentiment_score,
                "url": url,
                "date": datetime.now().isoformat(),
                "scraped_at": datetime.now().isoformat()
            }
            
            print(perspective)
            return perspective
            
        except Exception as e:
            logger.error(f"Unexpected error scraping {url}: {str(e)}")
            return None
        finally:
            if article_page:
                try:
                    article_page.close()
                except Exception as e:
                    logger.error(f"Error closing article page: {str(e)}")
    
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
                    
                    # Skip newsletter signups and other non-article content
                    if self._is_newsletter_or_non_article(title, link):
                        logger.info(f"  Skipping non-article entry: {title[:50]}...")
                        continue
                    
                    content = ""
                    if hasattr(entry, 'content') and entry.content:
                        content = entry.content[0].value
                    elif hasattr(entry, 'summary'):
                        content = entry.summary
                    elif hasattr(entry, 'description'):
                        content = entry.description
                        
                    combined_text = title + ". " + content if content else title
                    sentiment_score = self.analyze_sentiment(combined_text)
                    
                    quote = self.clean_html(content)

                    if source_name == "The Guardian" and quote.endswith(" Continue reading..."):
                        quote = quote[:-len(" Continue reading...")].strip()
                    
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
    
    def _is_newsletter_or_non_article(self, title: str, url: str) -> bool:
        """Check if an RSS entry is a newsletter signup or other non-article content"""
        # Keywords that indicate newsletter signups or non-article content
        newsletter_keywords = [
            "sign up for", "newsletter", "subscribe", "email", "signup", 
            "sign-up", "sign up", "subscribe to", "get our", "join our"
        ]
        
        # Check if title contains any of the newsletter keywords
        title_lower = title.lower()
        for keyword in newsletter_keywords:
            if keyword in title_lower:
                return True
                
        # Check URL patterns that might indicate non-article content
        url_lower = url.lower()
        non_article_patterns = [
            "/info/", "/about/", "/help/", "/support/", "/contact/", 
            "/subscribe/", "/newsletter/", "/email/", "/signup/"
        ]
        
        for pattern in non_article_patterns:
            if pattern in url_lower:
                return True
                
        return False
    
    def save_to_database(self, perspective: Dict[str, Any]):
        """Save perspective to Neon database"""
        if not self.db_conn:
            logger.warning("Database connection not available, skipping save")
            return
            
        try:
            cursor = self.db_conn.cursor()
            
            
            cursor.execute("""
                INSERT INTO perspectives 
                (id, title, source, community, quote, sentiment, url, scraped_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (url) DO UPDATE SET
                    quote = EXCLUDED.quote
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

        logger.info(f"Extracted domain: {domain}")
        
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
            logger.info(f"Using article selector: {article_selector}")
            article_elements = self.page.query_selector_all(article_selector)
            article_links = []
            seen_urls = set()  # Track URLs we've already seen
            
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
                        
                        # Skip if we've already seen this URL
                        if href in seen_urls:
                            continue
                        
                        seen_urls.add(href)
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
                    logger.info(f"Scraping article {i+1}/{len(article_links)}: {link}")
                    perspective = self.scrape_article(link, source_name, community)
                    if perspective:
                        perspectives.append(perspective)
                        logger.info(f"  Successfully scraped: {perspective['title'][:50]}...")
                        self.save_to_database(perspective)
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
            
            for source in sources:
                try:
                    logger.info(f"Scraping {source['source']}")
                    perspectives = self.scrape_news_site(source)
                    logger.info(f"Successfully scraped {len(perspectives)} articles from {source['source']}")
                    self.random_delay(3.0, 6.0)  # Longer delay between sites
                except Exception as e:
                    logger.error(f"Error processing {source['source']}: {str(e)}")
                    # Check if browser is still connected, if not, reconnect
                    if not self.browser.is_connected():
                        logger.info("Browser disconnected, reconnecting...")
                        self.teardown()
                        self.setup()
                    continue
                    
        finally:
            self.teardown()


def run(playwright: Playwright) -> None:
    scraper = ArticleScraper(playwright)
    scraper.run()


if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
