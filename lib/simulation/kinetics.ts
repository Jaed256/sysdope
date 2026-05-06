/**
 * Simplified Michaelis–Menten flux:
 *
 *   rate = vmax * activity * (1 - inhibitor) * S / (km + S)
 *
 * `inhibitor` is a unit-less factor in [0, 1]. `activity` is an enzyme
 * activity multiplier (typically 0–2). Substrate concentration `S` is
 * clamped to ≥ 0 before evaluation. Returns concentration units per time.
 */
export function mmRate(
  vmax: number,
  activity: number,
  inhibitor: number,
  substrate: number,
  km: number,
): number {
  const s = Math.max(0, substrate);
  const denom = Math.max(1e-9, km + s);
  const rate = (vmax * activity * (1 - inhibitor) * s) / denom;
  return rate < 0 ? 0 : rate;
}

/**
 * Mass-action / first-order rate for passive transitions (e.g. urinary
 * excretion or spontaneous chemistry).
 *
 *   rate = baseRate * substrate
 */
export function firstOrderRate(baseRate: number, substrate: number): number {
  if (baseRate <= 0) return 0;
  const s = Math.max(0, substrate);
  return baseRate * s;
}
