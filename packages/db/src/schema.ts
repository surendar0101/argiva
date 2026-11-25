import {
  bigint,
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = ['owner', 'manager', 'catalog_editor', 'fulfilment', 'support'] as const;
export type UserRole = (typeof userRoleEnum)[number];

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: userRoleEnum }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  displayOrder: integer('display_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const policyStatusEnum = ['draft', 'published'] as const;
export type PolicyStatus = (typeof policyStatusEnum)[number];

export type PolicyContentBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean };

export const policies = pgTable('policies', {
  slug: text('slug').primaryKey(),
  title: text('title').notNull(),
  content: jsonb('content').$type<PolicyContentBlock[]>().notNull(),
  status: text('status', { enum: policyStatusEnum }).default('draft').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const productStatusEnum = ['draft', 'published', 'archived'] as const;
export type ProductStatus = (typeof productStatusEnum)[number];

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id')
    .references(() => categories.id)
    .notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  careInstructions: text('care_instructions'),
  returnEligibility: text('return_eligibility'),
  searchTitle: text('search_title'),
  metaDescription: text('meta_description'),
  status: text('status', { enum: productStatusEnum }).default('draft').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const purityGradeEnum = ['92.5', '80', '60', 'other'] as const;
export type PurityGrade = (typeof purityGradeEnum)[number];

export const finishTypeEnum = ['plain', 'oxidised', 'rose_gold'] as const;
export type FinishType = (typeof finishTypeEnum)[number];

export const pricingModeEnum = ['fixed', 'silver_rate'] as const;
export type PricingMode = (typeof pricingModeEnum)[number];

export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .references(() => products.id)
    .notNull(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  purity: text('purity', { enum: purityGradeEnum }).notNull(),
  purityVerified: boolean('purity_verified').default(false).notNull(),
  finish: text('finish', { enum: finishTypeEnum }).notNull(),
  weightGrams: numeric('weight_grams', { precision: 8, scale: 2 }).notNull(),
  dimensions: text('dimensions'),
  pricingMode: text('pricing_mode', { enum: pricingModeEnum }).notNull(),
  fixedPricePaise: bigint('fixed_price_paise', { mode: 'number' }),
  makingChargesPaise: integer('making_charges_paise').default(0).notNull(),
  stockQuantity: integer('stock_quantity').default(0).notNull(),
  isPair: boolean('is_pair').default(false).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const rateStatusEnum = ['pending', 'approved', 'rejected'] as const;
export type RateStatus = (typeof rateStatusEnum)[number];

export const silverRates = pgTable('silver_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  ratePerGramPaise: integer('rate_per_gram_paise').notNull(),
  effectiveDate: timestamp('effective_date', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by')
    .references(() => users.id)
    .notNull(),
  approvedBy: uuid('approved_by').references(() => users.id),
  status: text('status', { enum: rateStatusEnum }).default('pending').notNull(),
  approvalReason: text('approval_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderStatusEnum = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof orderStatusEnum)[number];

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerName: text('customer_name').notNull(),
  shippingAddress: jsonb('shipping_address').notNull(),
  status: text('status', { enum: orderStatusEnum }).default('pending').notNull(),
  totalPaise: bigint('total_paise', { mode: 'number' }).notNull(),
  subtotalPaise: bigint('subtotal_paise', { mode: 'number' }).notNull(),
  shippingPaise: integer('shipping_paise').default(0).notNull(),
  taxPaise: integer('tax_paise').default(0).notNull(),
  packagingVideoUrl: text('packaging_video_url'),
  invoiceUrl: text('invoice_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export interface PricingSnapshotData {
  pricingMode: PricingMode;
  formulaVersion: string;
  weightGrams: number;
  purity: PurityGrade;
  purityVerified: boolean;
  baseRatePerGramPaise?: number | undefined;
  makingChargesPaise?: number | undefined;
  calculatedPricePaise: number;
  [key: string]: unknown;
}

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id)
    .notNull(),
  variantId: uuid('variant_id')
    .references(() => productVariants.id)
    .notNull(),
  sku: text('sku').notNull(),
  productName: text('product_name').notNull(),
  variantName: text('variant_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPricePaise: bigint('unit_price_paise', { mode: 'number' }).notNull(),
  totalPaise: bigint('total_paise', { mode: 'number' }).notNull(),
  pricingSnapshot: jsonb('pricing_snapshot').$type<PricingSnapshotData>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reservationStatusEnum = ['reserved', 'completed', 'expired', 'released'] as const;
export type ReservationStatus = (typeof reservationStatusEnum)[number];

export const stockReservations = pgTable('stock_reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
  variantId: uuid('variant_id')
    .references(() => productVariants.id)
    .notNull(),
  quantity: integer('quantity').notNull(),
  sessionId: text('session_id').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  status: text('status', { enum: reservationStatusEnum }).default('reserved').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  details: jsonb('details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Policy = typeof policies.$inferSelect;
export type NewPolicy = typeof policies.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type SilverRate = typeof silverRates.$inferSelect;
export type NewSilverRate = typeof silverRates.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type StockReservation = typeof stockReservations.$inferSelect;
export type NewStockReservation = typeof stockReservations.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
