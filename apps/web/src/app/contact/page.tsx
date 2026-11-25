import { getConfig } from '@argiva/config';
import Link from 'next/link';
import styles from './page.module.css';

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
            <dd>TODO(owner): official customer support phone number.</dd>
          </div>
          <div className={styles.entry}>
            <dt>Email</dt>
            <dd>TODO(owner): official customer support email.</dd>
          </div>
          <div className={styles.entry}>
            <dt>WhatsApp</dt>
            <dd>TODO(owner): official WhatsApp click-to-chat URL.</dd>
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
            <dd>Sole proprietorship.</dd>
          </div>
          <div className={styles.entry}>
            <dt>Legal name</dt>
            <dd>TODO(owner): add the proprietor’s legal name.</dd>
          </div>
          <div className={styles.entry}>
            <dt>Business address</dt>
            <dd>TODO(owner): add the full business address.</dd>
          </div>
          <div className={styles.entry}>
            <dt>Grievance officer</dt>
            <dd>The proprietor is the grievance officer. TODO(owner): add the name, email and phone.</dd>
          </div>
          <div className={styles.entry}>
            <dt>Jurisdiction</dt>
            <dd>Bengaluru (Bangalore), Karnataka.</dd>
          </div>
        </dl>
        <Link className={styles.policyLink} href="/policies/contact-disclosures">
          Seller & Grievance Details — Draft Policy
        </Link>
      </section>
    </main>
  );
}
