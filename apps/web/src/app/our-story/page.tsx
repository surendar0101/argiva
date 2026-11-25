import { Divider } from '@argiva/ui';
import Link from 'next/link';
import styles from './page.module.css';

export default function OurStoryPage() {
  return (
    <main className={styles.page}>
      <section className={styles.opening}>
        <div className={styles.openingInner}>
          <h1>Three Generations. One Continuing Legacy.</h1>
          <p>Every family business begins with a dream. Ours began with our grandfather.</p>
          <p>
            He laid the foundation of our family&apos;s silver jewellery business, building something that would go on to
            become part of our family story. Our father carried that work forward, continuing the business with a
            strong focus on offline customers and our traditional expertise in anklet-making.
          </p>
          <p>For years, our work has been rooted in silver, craftsmanship and the relationships built around it.</p>
          <p>Now, it is time for the next chapter.</p>
        </div>
      </section>

      <article className={styles.story}>
        <section className={styles.chapter}>
          <h2>A Legacy, Reimagined</h2>
          <p>
            I have always believed that the effort our family put into building this business deserves to continue into
            the future. I wanted to preserve what generations before us had created while finding a way to make it
            relevant to a new generation of customers.
          </p>
          <p>That thought inspired ARGIVA Silvers.</p>
          <p>
            In a world where digital experiences are changing the way we discover and shop, I saw an opportunity to
            bring our family&apos;s business online—to reach customers beyond our existing circles and introduce more people
            to the beauty of silver jewellery.
          </p>
          <p>This is not about leaving our roots behind. It is about giving them room to grow.</p>
        </section>

        <Divider context={{ page: 'our-story' }} />

        <section className={styles.chapter}>
          <h2>From Anklets to Every Silver Story</h2>
          <p>Anklets have always been an important part of our family&apos;s journey. They remain a meaningful connection to our beginnings.</p>
          <p>
            But ARGIVA is also about exploring the many ways silver can become part of modern life—from chains,
            pendants, bangles and bracelets to earrings, rings and thoughtful gifts.
          </p>
          <p>
            Our collections bring together traditional inspiration and contemporary style, with the aim of helping
            every customer discover a piece that suits their taste, occasion and story.
          </p>
        </section>

        <Divider context={{ page: 'our-story' }} />

        <section className={styles.chapter}>
          <h2>Our Promise to You</h2>
          <p>
            As we build ARGIVA, we want to grow with care, honesty and a deep respect for the legacy we have inherited.
          </p>
          <p>
            We believe customers deserve clear product information, a personal shopping experience and the confidence
            to understand what they are buying.
          </p>
          <p>Every new collection is another step in our journey—one that honours our family&apos;s beginnings while opening the door to new possibilities.</p>
          <p>Thank you for being part of this next chapter.</p>
          <p>Welcome to ARGIVA Silvers.</p>
          <Link className={styles.action} href="/collections">
            Find Your Favourite
          </Link>
        </section>
      </article>
    </main>
  );
}
