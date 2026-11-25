import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import {
  categories,
  policies,
  products,
  productVariants,
  silverRates,
  users,
  type NewCategory,
  type NewPolicy,
  type NewProduct,
  type NewProductVariant,
  type NewSilverRate,
  type NewUser,
} from './schema';

export const OWNER_USER_ID = '00000000-0000-0000-0000-000000000001';

const sampleUsers: NewUser[] = [
  {
    id: OWNER_USER_ID,
    email: 'owner@argivasilvers.com',
    name: 'ARGIVA Owner',
    role: 'owner',
  },
];

const sampleCategories: NewCategory[] = [
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

const sampleProducts: NewProduct[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    categoryId: '10000000-0000-0000-0000-000000000004', // Anklets
    name: 'Ghungroo Heritage Silver Anklets',
    slug: 'ghungroo-heritage-silver-anklets',
    description:
      'Artisanal handcrafted silver anklets with delicate ghungroo bells inspired by traditional Indian silversmithing.',
    careInstructions: 'Store in airtight packaging; avoid contact with perfume and direct moisture.',
    returnEligibility: 'Replacement only for reported transit damage within 2 days with unboxing video.',
    status: 'published',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    categoryId: '10000000-0000-0000-0000-000000000001', // Chains
    name: 'Classic Curb Silver Chain',
    slug: 'classic-curb-silver-chain',
    description: 'Precision-crafted sterling silver curb chain with secure lobster clasp.',
    careInstructions: 'Clean gently with a soft microfibre cloth.',
    returnEligibility: 'Replacement only for reported transit damage within 2 days with unboxing video.',
    status: 'published',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    categoryId: '10000000-0000-0000-0000-000000000002', // Earrings
    name: 'Marcellus Silver Studs',
    slug: 'marcellus-silver-studs',
    description: 'Understated geometric sterling silver studs for everyday luxury.',
    careInstructions: 'Wipe dry after wear.',
    returnEligibility: 'Replacement only for reported transit damage within 2 days with unboxing video.',
    status: 'published',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    categoryId: '10000000-0000-0000-0000-000000000003', // Bangles
    name: 'Traditional Filigree Silver Bangle',
    slug: 'traditional-filigree-silver-bangle',
    description: 'Intricate filigree wirework handcrafted in 80% silver composition.',
    careInstructions: 'Handle with care; avoid bending or excess pressure.',
    returnEligibility: 'Replacement only for reported transit damage within 2 days with unboxing video.',
    status: 'published',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    categoryId: '10000000-0000-0000-0000-000000000005', // Rings
    name: 'Minimalist Silver Band',
    slug: 'minimalist-silver-band',
    description: 'Sleek silver band finished with a delicate rose-gold electroplated accent.',
    careInstructions: 'Avoid harsh abrasives or chemical polish on plated surfaces.',
    returnEligibility: 'Replacement only for reported transit damage within 2 days with unboxing video.',
    status: 'published',
  },
];

const sampleVariants: NewProductVariant[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    productId: '20000000-0000-0000-0000-000000000001',
    sku: 'ANK-GHU-925',
    name: 'Pair 10.5 inch',
    purity: '92.5',
    purityVerified: true,
    finish: 'oxidised',
    weightGrams: '38.50',
    pricingMode: 'silver_rate',
    makingChargesPaise: 75000,
    stockQuantity: 12,
    isPair: true, // Brand Content §5: Anklets are always sold as a pair
    isActive: true,
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    productId: '20000000-0000-0000-0000-000000000002',
    sku: 'CHN-CRB-925',
    name: '20 inch Chain',
    purity: '92.5',
    purityVerified: true,
    finish: 'plain',
    weightGrams: '18.20',
    pricingMode: 'silver_rate',
    makingChargesPaise: 45000,
    stockQuantity: 20,
    isPair: false,
    isActive: true,
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    productId: '20000000-0000-0000-0000-000000000003',
    sku: 'ERR-MRC-925',
    name: 'Classic Stud Pair',
    purity: '92.5',
    purityVerified: true,
    finish: 'plain',
    weightGrams: '4.80',
    pricingMode: 'fixed',
    fixedPricePaise: 179900, // ₹1,799.00
    makingChargesPaise: 0,
    stockQuantity: 35,
    isPair: true,
    isActive: true,
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    productId: '20000000-0000-0000-0000-000000000004',
    sku: 'BNG-FLG-800',
    name: 'Size 2.4',
    purity: '80',
    purityVerified: true,
    finish: 'plain',
    weightGrams: '28.00',
    pricingMode: 'silver_rate',
    makingChargesPaise: 60000,
    stockQuantity: 8,
    isPair: false,
    isActive: true,
  },
  {
    id: '30000000-0000-0000-0000-000000000005',
    productId: '20000000-0000-0000-0000-000000000005',
    sku: 'RNG-MNM-925',
    name: 'Size 14',
    purity: '92.5',
    purityVerified: true,
    finish: 'rose_gold',
    weightGrams: '3.50',
    pricingMode: 'fixed',
    fixedPricePaise: 129900, // ₹1,299.00
    makingChargesPaise: 0,
    stockQuantity: 15,
    isPair: false,
    isActive: true,
  },
];

const sampleSilverRate: NewSilverRate = {
  id: '40000000-0000-0000-0000-000000000001',
  ratePerGramPaise: 9850, // ₹98.50 per gram for 999 fine silver
  createdBy: OWNER_USER_ID,
  approvedBy: OWNER_USER_ID,
  status: 'approved',
  approvalReason: 'Initial verified benchmark silver rate',
};

const samplePolicies: NewPolicy[] = [
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    status: 'draft',
    content: [
      {
        type: 'paragraph',
        text: 'TODO(owner): Provide Terms & Conditions content and obtain legal review before publication.',
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    status: 'draft',
    content: [
      {
        type: 'paragraph',
        text: 'TODO(owner): Provide the privacy notice and confirm the personal information ARGIVA processes, purposes, retention, sharing and customer rights under the DPDP Act 2023 before publication.',
      },
    ],
  },
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
      {
        type: 'paragraph',
        text: 'TODO(owner): Confirm the approved flat domestic shipping fee and selected shipping aggregator before publication.',
      },
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
  {
    slug: 'cookies',
    title: 'Cookie Notice',
    status: 'draft',
    content: [
      {
        type: 'paragraph',
        text: 'TODO(owner): Confirm whether ARGIVA uses cookies or similar technologies, what they are used for, and any consent choices before publishing this notice.',
      },
    ],
  },
  {
    slug: 'contact-disclosures',
    title: 'Seller & Grievance Details',
    status: 'draft',
    content: [
      { type: 'paragraph', text: 'Seller entity: Sole proprietorship.' },
      { type: 'paragraph', text: 'Legal name: TODO(owner): add the proprietor’s legal name.' },
      { type: 'paragraph', text: 'Business address: TODO(owner): add the full business address.' },
      { type: 'paragraph', text: 'Grievance officer: The proprietor is the grievance officer.' },
      { type: 'paragraph', text: 'Grievance officer name: TODO(owner): add the full name.' },
      { type: 'paragraph', text: 'Email: TODO(owner): add a monitored contact email.' },
      { type: 'paragraph', text: 'Phone: TODO(owner): add a contact phone number.' },
      { type: 'paragraph', text: 'Jurisdiction: Bengaluru (Bangalore), Karnataka.' },
    ],
  },
];

export const initialSeedData = {
  users: sampleUsers,
  categories: sampleCategories,
  products: sampleProducts,
  variants: sampleVariants,
  silverRate: sampleSilverRate,
  policies: samplePolicies,
};

/**
 * Seeds the database with essential brand categories, products, variants, and silver rate.
 */
export async function seedDatabase(db: PostgresJsDatabase<typeof schema>): Promise<void> {
  // Insert Users
  for (const u of initialSeedData.users) {
    await db.insert(users).values(u).onConflictDoNothing();
  }

  // Insert Silver Rate
  await db.insert(silverRates).values(initialSeedData.silverRate).onConflictDoNothing();

  // Insert Categories
  for (const c of initialSeedData.categories) {
    await db.insert(categories).values(c).onConflictDoNothing();
  }

  // Insert Products
  for (const p of initialSeedData.products) {
    await db.insert(products).values(p).onConflictDoNothing();
  }

  // Insert Variants
  for (const v of initialSeedData.variants) {
    await db.insert(productVariants).values(v).onConflictDoNothing();
  }

  for (const policy of initialSeedData.policies) {
    await db.insert(policies).values(policy).onConflictDoNothing();
  }
}
