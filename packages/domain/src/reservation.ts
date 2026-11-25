export type ReservationStatus = 'reserved' | 'completed' | 'expired' | 'released';

export interface ReservationItem {
  id?: string;
  variantId: string;
  quantity: number;
  sessionId: string;
  expiresAt: Date;
  status: ReservationStatus;
  createdAt?: Date;
}

export interface CreateReservationInput {
  variantId: string;
  quantity: number;
  sessionId: string;
  ttlMinutes?: number;
  currentTime?: Date;
}

export interface ReservationCheckTarget {
  status: ReservationStatus;
  expiresAt: Date;
  quantity?: number;
}

/**
 * Creates a stock reservation with TTL (default 15 minutes).
 */
export function createReservation(input: CreateReservationInput): ReservationItem {
  const { variantId, quantity, sessionId, ttlMinutes = 15, currentTime = new Date() } = input;

  if (quantity <= 0 || !Number.isInteger(quantity)) {
    throw new Error('Reservation quantity must be greater than 0 and an integer');
  }

  const expiresAt = new Date(currentTime.getTime() + ttlMinutes * 60 * 1000);

  return {
    variantId,
    quantity,
    sessionId,
    expiresAt,
    status: 'reserved',
    createdAt: currentTime,
  };
}

/**
 * Checks if a reservation is currently active (status is reserved and expiry is in the future).
 */
export function isReservationActive(
  reservation: ReservationCheckTarget,
  currentTime: Date = new Date(),
): boolean {
  if (reservation.status !== 'reserved') {
    return false;
  }
  return reservation.expiresAt.getTime() > currentTime.getTime();
}

/**
 * Calculates current available inventory given total stock and reservations.
 * Expired or released reservations are automatically excluded from the calculation.
 */
export function calculateAvailableStock(
  totalStock: number,
  reservations: ReservationCheckTarget[],
  currentTime: Date = new Date(),
): number {
  let reservedSum = 0;

  for (const r of reservations) {
    if (isReservationActive(r, currentTime)) {
      reservedSum += r.quantity ?? 0;
    }
  }

  return Math.max(0, totalStock - reservedSum);
}
