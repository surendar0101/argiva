import { describe, expect, it } from 'vitest';
import {
  calculateAvailableStock,
  createReservation,
  isReservationActive,
} from './reservation';

describe('Stock Reservation & Inventory Logic', () => {
  const baseTime = new Date('2026-11-11T12:00:00Z');

  describe('createReservation', () => {
    it('creates a reservation with active status and specified TTL in minutes', () => {
      const reservation = createReservation({
        variantId: 'variant-123',
        quantity: 2,
        sessionId: 'session-abc',
        ttlMinutes: 15,
        currentTime: baseTime,
      });

      expect(reservation.variantId).toBe('variant-123');
      expect(reservation.quantity).toBe(2);
      expect(reservation.sessionId).toBe('session-abc');
      expect(reservation.status).toBe('reserved');
      expect(reservation.expiresAt.toISOString()).toBe('2026-11-11T12:15:00.000Z');
    });

    it('throws error for non-positive quantity', () => {
      expect(() =>
        createReservation({
          variantId: 'variant-123',
          quantity: 0,
          sessionId: 'session-abc',
          ttlMinutes: 15,
          currentTime: baseTime,
        }),
      ).toThrowError(/quantity must be greater than 0/i);
    });
  });

  describe('isReservationActive (Review Focus 4)', () => {
    it('returns true when reservation is within TTL and status is reserved', () => {
      const reservation = {
        status: 'reserved' as const,
        expiresAt: new Date('2026-11-11T12:15:00Z'),
      };
      const now = new Date('2026-11-11T12:10:00Z');

      expect(isReservationActive(reservation, now)).toBe(true);
    });

    it('returns false when reservation has expired past TTL', () => {
      const reservation = {
        status: 'reserved' as const,
        expiresAt: new Date('2026-11-11T12:15:00Z'),
      };
      const now = new Date('2026-11-11T12:15:01Z');

      expect(isReservationActive(reservation, now)).toBe(false);
    });

    it('returns false if reservation is released or completed even if within TTL', () => {
      const released = {
        status: 'released' as const,
        expiresAt: new Date('2026-11-11T12:30:00Z'),
      };
      const completed = {
        status: 'completed' as const,
        expiresAt: new Date('2026-11-11T12:30:00Z'),
      };
      const now = new Date('2026-11-11T12:10:00Z');

      expect(isReservationActive(released, now)).toBe(false);
      expect(isReservationActive(completed, now)).toBe(false);
    });
  });

  describe('calculateAvailableStock', () => {
    it('subtracts only currently active reservations from total inventory', () => {
      const now = new Date('2026-11-11T12:10:00Z');
      const totalStock = 10;

      const reservations = [
        {
          quantity: 2,
          status: 'reserved' as const,
          expiresAt: new Date('2026-11-11T12:15:00Z'), // Active
        },
        {
          quantity: 3,
          status: 'reserved' as const,
          expiresAt: new Date('2026-11-11T12:05:00Z'), // Expired! Should be released
        },
        {
          quantity: 1,
          status: 'released' as const,
          expiresAt: new Date('2026-11-11T12:20:00Z'), // Released
        },
      ];

      const available = calculateAvailableStock(totalStock, reservations, now);
      // Only the 2 items from the active reservation are held
      expect(available).toBe(8);
    });

    it('clamps available stock to 0 if reservations exceed stock', () => {
      const now = new Date('2026-11-11T12:00:00Z');
      const totalStock = 2;
      const reservations = [
        {
          quantity: 5,
          status: 'reserved' as const,
          expiresAt: new Date('2026-11-11T12:10:00Z'),
        },
      ];

      expect(calculateAvailableStock(totalStock, reservations, now)).toBe(0);
    });
  });
});
