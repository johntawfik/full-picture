import styles from './page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About</h1>
      <div className={styles.content}>
        <section className={styles.section}>
          <p>
            In today&apos;s media landscape, what you see isn&apos;t always the full story — it&apos;s the version that drives the most clicks.
          </p>
          <p>
            Algorithms on platforms like TikTok, Instagram, and even major news outlets prioritize engagement over balance. 
            They amplify the content most likely to keep you watching, regardless of accuracy or political leaning. 
            The result? A society pulled further apart, with each of us living in curated echo chambers.
          </p>
        </section>

        <section className={styles.section}>
          <p>
            Full Picture was built to change that.
          </p>
          <p>
            We believe a healthier, more informed world starts with seeing issues from multiple angles — not just the ones 
            that confirm what we already believe. Our goal is to show you how stories are covered across the political 
            spectrum so you can decide for yourself, without spin.
          </p>
          <p>
            This isn&apos;t about changing minds. It&apos;s about opening them.
          </p>
        </section>
      </div>
    </div>
  );
} 