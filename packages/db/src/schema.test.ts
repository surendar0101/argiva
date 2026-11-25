import { describe, expect, it } from 'vitest';
import {
  auditLogs,
  categories,
  orderItems,
  orders,
  products,
  productVariants,
  silverRates,
  stockReservations,
  users,
} from './schema';
import { getDb } from './index';

describe('Database Schema & Client', () => {
  it('exports all required domain tables', () => {
    expect(users).toBeDefined();
    expect(categories).toBeDefined();
    expect(products).toBeDefined();
    expect(productVariants).toBeDefined();
    expect(silverRates).toBeDefined();
    expect(orders).toBeDefined();
    expect(orderItems).toBeDefined();
    expect(stockReservations).toBeDefined();
    expect(auditLogs).toBeDefined();
  });

  it('defines the correct columns on users', () => {
    expect(users.id).toBeDefined();
    expect(users.email).toBeDefined();
    expect(users.name).toBeDefined();
    expect(users.role).toBeDefined();
    expect(users.createdAt).toBeDefined();
    expect(users.updatedAt).toBeDefined();
  });

  it('defines the correct columns on productVariants for ADR 0006 & ADR 0007', () => {
    expect(productVariants.id).toBeDefined();
    expect(productVariants.productId).toBeDefined();
    expect(productVariants.sku).toBeDefined();
    expect(productVariants.purity).toBeDefined();
    expect(productVariants.purityVerified).toBeDefined();
    expect(productVariants.finish).toBeDefined();
    expect(productVariants.weightGrams).toBeDefined();
    expect(productVariants.pricingMode).toBeDefined();
    expect(productVariants.fixedPricePaise).toBeDefined();
    expect(productVariants.makingChargesPaise).toBeDefined();
    expect(productVariants.isPair).toBeDefined();
  });

  it('defines pricingSnapshot on orderItems to preserve ADR 0007 snapshot invariants', () => {
    expect(orderItems.id).toBeDefined();
    expect(orderItems.orderId).toBeDefined();
    expect(orderItems.unitPricePaise).toBeDefined();
    expect(orderItems.pricingSnapshot).toBeDefined();
  });

  it('exports getDb function', () => {
    expect(typeof getDb).toBe('function');
  });
});
