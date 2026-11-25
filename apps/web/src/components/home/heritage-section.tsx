import Link from 'next/link';
import styles from './heritage-section.module.css';

export function HeritageSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>A Legacy That Deserves to Shine.</h2>
        <div className={styles.content}>
          <p>
            ARGIVA began with our grandfather, who built the foundations of our family&apos;s silver jewellery business. Our
            father carried that legacy forward, nurturing the business with a strong focus on traditional, offline
            craftsmanship and anklet-making.
          </p>
          <p>
            Today, we are taking the next step—bringing our family&apos;s journey into the digital world while staying true
            to the values on which it was built.
          </p>
          <p>
            ARGIVA is our way of honouring the past, embracing the present and creating something meaningful for the
            next generation.
          </p>
          <p>
            From the anklets that shaped our beginnings to the chains, pendants, earrings, rings and more that define
            our growing collections, every step reflects our belief that silver is more than jewellery. It is a part of
            our stories, traditions and everyday lives.
          </p>
        </div>
        <div className={styles.action}>
          <Link href="/our-story" className={styles.button}>
            Get to Know ARGIVA
          </Link>
        </div>
      </div>
    </section>
  );
}
