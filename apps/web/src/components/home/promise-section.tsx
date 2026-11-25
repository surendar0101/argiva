import styles from './promise-section.module.css';

const PROMISES = [
  {
    title: 'Rooted in Legacy',
    description: 'Inspired by a family journey spanning three generations.',
  },
  {
    title: 'Made for Modern Living',
    description: 'Jewellery for everyday elegance, special occasions and meaningful gifts.',
  },
  {
    title: 'Clear Product Information',
    description: 'Explore product details, silver composition, finishes and pricing before you buy.',
  },
  {
    title: 'A Personal Shopping Experience',
    description: 'Browse online, complete your purchase securely or connect with us on WhatsApp for assistance.',
  },
];

export function PromiseSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>The ARGIVA Promise</h2>
        <div className={styles.grid}>
          {PROMISES.map((promise) => (
            <div key={promise.title} className={styles.item}>
              <h3 className={styles.itemTitle}>{promise.title}</h3>
              <p className={styles.itemDescription}>{promise.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
