/** Deterministic hash in [0, 1) so demo data is stable between reloads. */
export function seeded(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  h ^= h >>> 13
  h = Math.imul(h, 0x5bd1e995)
  h ^= h >>> 15
  return (h >>> 0) / 4294967296
}

/** Round to a typical US shelf price ending in 9 cents. */
export function shelfPrice(value: number): number {
  if (value < 1.5) return Math.round(value * 100) / 100
  return Math.max(0.49, Math.round(value * 10) / 10 - 0.01)
}
