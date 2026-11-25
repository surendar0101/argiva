import { getConfig } from '@argiva/config';
import Link from 'next/link';
import { getCategories } from '../../lib/catalog';
import styles from './site-footer.module.css';

const POLICY_LINKS = [
  { href: '/policies/terms', label: 'Terms & Conditions' },
  { href: '/policies/privacy', label: 'Privacy Policy' },
  { href: '/policies/shipping', label: 'Shipping & Delivery' },
  { href: '/policies/returns', label: 'Returns & Damaged Products' },
  { href: '/policies/cancellation', label: 'Cancellation & Refunds' },
  { href: '/policies/care', label: 'Care & Re-polishing' },
  { href: '/policies/cookies', label: 'Cookie Notice' },
  { href: '/policies/contact-disclosures', label: 'Seller & Grievance Details' },
];

export async function SiteFooter() {
  const categories = await getCategories();
  const instagramUrl = getConfig().instagramUrl;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <h2 className={styles.brandName}>ARGIVA Silvers</h2>
            <p className={styles.tagline}>Modern Silver. Timeless Stories.</p>
            <p className={styles.heritage}>
              A third-generation family silver jewellery business bringing traditional craftsmanship into the modern
              world.
            </p>
          </div>

          <div className={styles.links}>
            <h3 className={styles.linksTitle}>Collections</h3>
            <ul className={styles.linksList}>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/collections/${category.slug}`} className={styles.link}>
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link href="/collections" className={styles.link}>
                    Shop All Collections
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className={styles.links}>
            <h3 className={styles.linksTitle}>Information</h3>
            <ul className={styles.linksList}>
              <li>
                <Link href="/our-story" className={styles.link}>
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/faq" className={styles.link}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.link}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.links}>
            <h3 className={styles.linksTitle}>Legal</h3>
            <ul className={styles.linksList}>
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.connect}>
            <h3 className={styles.linksTitle}>Stay Connected</h3>
            <div className={styles.social}>
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Follow us on Instagram"
                >
                  Instagram
                </a>
              ) : (
                <span className={styles.socialLink}>Instagram: @argiva_silvers</span>
              )}
              <span className={styles.socialLink}>WhatsApp: TODO(owner): official WhatsApp click-to-chat URL.</span>
            </div>
            <p className={styles.grievance}>
              <strong>Consumer Grievance Officer:</strong>
              <br />
              TODO(owner): Name
              <br />
              TODO(owner): Email
              <br />
              TODO(owner): Phone
            </p>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} ARGIVA Silvers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
