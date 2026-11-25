import { getConfig } from '@argiva/config';
import Link from 'next/link';
import { DETAILS_COMING_SOON } from '../../lib/placeholders';
import styles from './page.module.css';

// TODO(owner): confirm the support phone, email and WhatsApp link, the seller entity (once
// registered), legal name, business address, grievance officer and jurisdiction.
export default function ContactPage() {
  const instagramUrl = getConfig().instagramUrl;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Contact ARGIVA</h1>
        <p>Use the official contact details published on our website or message us through our Instagram account:</p>
      </header>

      <section aria-labelledby="support-heading" className={styles.section}>
        <h2 id="support-heading">Customer support</h2>
        <dl className={styles.ledger}>
          <div className={styles.entry}>
            <dt>Phone</dt>
            <dd>{DETAILS_COMING_SOON}</dd>
          </div>
          <div className={styles.entry}>
            <dt>Email</dt>
            <dd>{DETAILS_COMING_SOON}</dd>
          </div>
          <div className={styles.entry}>
            <dt>WhatsApp</dt>
            <dd>{DETAILS_COMING_SOON}</dd>
          </div>
          <div className={styles.entry}>
            <dt>Instagram</dt>
            <dd>
              {instagramUrl ? (
                <a href={instagramUrl} rel="noopener noreferrer" target="_blank">
                  @argiva_silvers
                </a>
              ) : (
                <span>@argiva_silvers</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="seller-heading" className={styles.section}>
        <h2 id="seller-heading">Seller & Grievance Details</h2>
        <dl className={styles.ledger}>
          <div className={styles.entry}>
            <dt>Seller entity</dt>
            <dd>{DETAILS_COMING_SOON}</dd>
          </div>
          <div className={styles.entry}>
            <dt>Legal name</dt>
            <dd>{DETAILS_COMING_SOON}</dd>
          </div>
          <div className={styles.entry}>
            <dt>Business address</dt>
            <dd>{DETAILS_COMING_SOON}</dd>
          </div>
          <div className={styles.entry}>
            <dt>Grievance officer</dt>
            <dd>{DETAILS_COMING_SOON}</dd>
          </div>
          <div className={styles.entry}>
            <dt>Jurisdiction</dt>
            <dd>{DETAILS_COMING_SOON}</dd>
          </div>
        </dl>
        <Link className={styles.policyLink} href="/policies/contact-disclosures">
          Seller & Grievance Details — Draft Policy
        </Link>
      </section>
    </main>
  );
}
