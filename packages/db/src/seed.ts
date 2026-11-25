import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { categories, policies, type NewCategory, type NewPolicy } from './schema';

const COMING_SOON = 'Details coming soon.';

function comingSoon(): NewPolicy['content'] {
  return [{ type: 'paragraph', text: COMING_SOON }];
}

const referenceCategories: NewCategory[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Chains & Pendants',
    slug: 'chains-and-pendants',
    description:
      'Silver chains and pendants that bring effortless elegance to everyday outfits and special occasions.',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Earrings',
    slug: 'earrings',
    description:
      'From understated studs to eye-catching designs, explore silver earrings that add something special to your style.',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Bangles & Bracelets',
    slug: 'bangles-and-bracelets',
    description:
      'Discover silver wristwear that balances tradition and modern style.',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name: 'Anklets — Our Heritage Collection',
    slug: 'anklets',
    description:
      "Anklets are where our family's silver jewellery story has its roots. Explore our range of designs.",
    displayOrder: 4,
    isActive: true,
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    name: 'Rings',
    slug: 'rings',
    description:
      'Small details can make a statement. Explore silver rings that complement your everyday look.',
    displayOrder: 5,
    isActive: true,
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    name: 'Silver Gifting',
    slug: 'silver-gifting',
    description:
      'Celebrate new beginnings, festivals, milestones and meaningful relationships with silver gifts.',
    displayOrder: 6,
    isActive: true,
  },
];

const referencePolicies: NewPolicy[] = [
  // TODO(owner): terms need your text and a legal review before publication.
  { slug: 'terms', title: 'Terms & Conditions', status: 'draft', content: comingSoon() },
  // TODO(owner): confirm the personal information processed, purposes, retention, sharing and
  // customer rights under the DPDP Act 2023.
  { slug: 'privacy', title: 'Privacy Policy', status: 'draft', content: comingSoon() },
  // TODO(owner): confirm the flat domestic shipping fee and the shipping aggregator.
  {
    slug: 'shipping',
    title: 'Shipping & Delivery',
    status: 'draft',
    content: [
      { type: 'paragraph', text: 'ARGIVA Silvers currently offers delivery across India.' },
      {
        type: 'paragraph',
        text: 'Shipping charges: Applicable shipping charges will be communicated or displayed before the order is confirmed.',
      },
      {
        type: 'paragraph',
        text: 'Dispatch: We aim to dispatch confirmed orders promptly. Actual dispatch and delivery timelines will be communicated through the website or order confirmation.',
      },
      {
        type: 'paragraph',
        text: 'Cash on delivery: Cash on delivery is not available. Orders must be paid for through the supported online payment methods.',
      },
      {
        type: 'paragraph',
        text: 'Order packaging: For transparency, ARGIVA records a video of the product packaging process and shares it with the customer along with the online invoice.',
      },
      {
        type: 'paragraph',
        text: 'Delivery issues: If your parcel arrives damaged, please refer to our Returns & Damaged Products Policy and contact us promptly with the required opening video and order details.',
      },
      {
        type: 'paragraph',
        text: 'For shipping-related assistance, contact ARGIVA through our official customer support channel.',
      },
      { type: 'paragraph', text: COMING_SOON },
    ],
  },
  {
    slug: 'returns',
    title: 'Returns & Damaged Products',
    status: 'draft',
    content: [
      {
        type: 'paragraph',
        text: 'We want you to receive your ARGIVA jewellery in the condition in which it was intended to reach you.',
      },
      { type: 'heading', text: 'Damaged Products' },
      { type: 'paragraph', text: 'If you receive a damaged product, contact ARGIVA within 2 days of delivery.' },
      { type: 'paragraph', text: 'To submit a claim:' },
      {
        type: 'list',
        ordered: true,
        items: [
          'Record a clear, continuous video while opening the parcel, showing the outer packaging, package contents and the product.',
          'Retain the original packaging and invoice.',
          'Contact ARGIVA with your order details and the opening video within the specified period.',
        ],
      },
      {
        type: 'paragraph',
        text: 'All claims are subject to review and approval by ARGIVA. Please contact us as soon as possible so we can assess the issue.',
      },
      { type: 'heading', text: 'Resolution for Approved Claims' },
      {
        type: 'list',
        items: [
          'If the same product is available, a replacement of the same product may be arranged.',
          'If the same product is unavailable, you may choose an alternative product of equivalent value to the amount paid for the original item.',
          'Cash refunds or cash replacements are not offered under this proposed policy.',
        ],
      },
      { type: 'paragraph', text: 'Any replacement will be coordinated with you after the claim has been reviewed.' },
      { type: 'heading', text: 'Exchanges' },
      {
        type: 'paragraph',
        text: 'We do not offer exchanges based solely on a change of preference after purchase. If you are unsure about a product before ordering, please contact us for additional photographs, product details or a video call to help you make an informed choice.',
      },
    ],
  },
  {
    slug: 'cancellation',
    title: 'Cancellation & Refunds',
    status: 'draft',
    content: [
      {
        type: 'paragraph',
        text: 'Orders may be cancelled without charge before dispatch. Cancellation is not available after dispatch.',
      },
      {
        type: 'paragraph',
        text: 'Full refunds for eligible cancellations, failed payments and duplicate payments are returned to the original payment method within 5–7 business days.',
      },
      {
        type: 'paragraph',
        text: 'This cancellation and payment-failure refund policy is separate from damage claims, which do not offer cash refunds under the proposed Returns & Damaged Products Policy.',
      },
    ],
  },
  {
    slug: 'care',
    title: 'Care & Re-polishing',
    status: 'draft',
    content: [
      { type: 'paragraph', text: 'Silver jewellery deserves a little care to keep it looking its best.' },
      {
        type: 'list',
        items: [
          'Store your jewellery in a clean, dry place, preferably in a separate pouch or jewellery box.',
          'Avoid direct contact with perfumes, lotions, household chemicals and cleaning products.',
          'Remove jewellery before swimming, bathing or strenuous activities, where appropriate for the item.',
          'Gently wipe your jewellery with a suitable soft cloth after use.',
          'Take extra care with plated or coloured finishes, including rose-gold finishes. Abrasive cleaners and polishing compounds may damage the finish.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Silver may naturally tarnish over time depending on its composition, finish, storage and exposure to the environment. If your jewellery needs attention, contact ARGIVA to ask about re-polishing options.',
      },
      { type: 'heading', text: 'Re-Polishing Service' },
      {
        type: 'paragraph',
        text: 'To request re-polishing, please retain your original ARGIVA invoice or bill. The applicable re-polishing charge will be determined using the prevailing rate at the time of service and communicated before the service is confirmed.',
      },
      {
        type: 'paragraph',
        text: 'Eligibility, turnaround time and the scope of the service will be confirmed by ARGIVA for the individual item.',
      },
    ],
  },
  // TODO(owner): confirm which cookies are used, why, and any consent choices.
  { slug: 'cookies', title: 'Cookie Notice', status: 'draft', content: comingSoon() },
  // TODO(owner): confirm the seller entity (once registered), proprietor's legal name, business
  // address, grievance officer name, email and phone, and jurisdiction.
  {
    slug: 'contact-disclosures',
    title: 'Seller & Grievance Details',
    status: 'draft',
    content: [
      'Seller entity',
      'Legal name',
      'Business address',
      'Grievance officer',
      'Email',
      'Phone',
      'Jurisdiction',
    ].map((label) => ({ type: 'paragraph' as const, text: `${label}: ${COMING_SOON}` })),
  },
];

export const initialSeedData = {
  categories: referenceCategories,
  policies: referencePolicies,
};

/**
 * Seeds the reference data: brand categories and draft policies.
 * Only adds missing rows; it never changes or deletes existing ones.
 */
export async function seedDatabase(db: PostgresJsDatabase<typeof schema>): Promise<void> {
  for (const c of initialSeedData.categories) {
    await db.insert(categories).values(c).onConflictDoNothing();
  }

  for (const policy of initialSeedData.policies) {
    await db.insert(policies).values(policy).onConflictDoNothing();
  }
}
