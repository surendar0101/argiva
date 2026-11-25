import { getConfig } from '@argiva/config';
import styles from './page.module.css';

export default function FAQPage() {
  const instagramAccount = getConfig().instagramUrl ?? '@argiva_silvers';
  const questions = [
    {
      question: 'What types of jewellery does ARGIVA offer?',
      answer:
        'Our collections include chains, pendants, bangles, bracelets, anklets, earrings, rings and silver gifting items. Our range will continue to grow as we introduce new designs.',
    },
    {
      question: 'Is all ARGIVA jewellery made from 925 sterling silver?',
      answer:
        'Not necessarily. Our family business has experience with different silver compositions, including 92.5%, 80% and 60% silver. The composition of each item will be stated on its individual product page. Please check the product details before ordering.',
    },
    {
      question: 'Do you offer rose-gold-finish jewellery?',
      answer:
        'Selected designs may feature a rose-gold finish. Please check the individual product description for the underlying metal and finish specifications.',
    },
    {
      question: 'Do you deliver across India?',
      answer:
        'Yes, ARGIVA currently offers delivery across India. Applicable shipping charges will be communicated or shown before the order is confirmed.',
    },
    {
      question: 'Can I pay cash on delivery?',
      answer: 'No. Cash on delivery is not available. Please use one of the supported online payment methods.',
    },
    {
      question: 'Can I see a product before placing my order?',
      answer:
        'You can contact us to request additional product details, photographs or a video call where feasible, so you can make an informed purchase decision.',
    },
    {
      question: 'Can I return a product if I do not like it?',
      answer:
        'Preference-based returns and exchanges are not offered under our proposed policy. If a product arrives damaged, contact ARGIVA within two days of delivery with the required parcel-opening video. Claims are subject to review and approval.',
    },
    {
      question: 'What should I do if my product arrives damaged?',
      answer:
        'Retain the packaging and invoice, record a clear video of the parcel opening and contact ARGIVA within two days of delivery. We will review the claim and communicate the available resolution.',
    },
    {
      question: 'Does ARGIVA offer re-polishing?',
      answer:
        'Re-polishing may be available for eligible items. You will need the original invoice or bill. Charges will be based on the prevailing rate at the time of service.',
    },
    {
      question: 'How can I find out about new arrivals?',
      answer:
        'Follow @argiva_silvers on Instagram and visit the website for new collections and product updates.',
    },
    {
      question: 'How can I contact ARGIVA?',
      answer: `Use the official contact details published on our website or message us through our Instagram account: ${instagramAccount}`,
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Frequently Asked Questions</h1>
      </header>
      <section aria-label="Frequently asked questions" className={styles.questions}>
        {questions.map(({ question, answer }) => (
          <details className={styles.question} key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
