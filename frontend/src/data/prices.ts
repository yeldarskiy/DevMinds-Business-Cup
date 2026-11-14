import type { Availability, Category, PriceQuote, StoreId } from '../types'
import { seeded, shelfPrice } from '../utils/seed'
import { BASE_PRICES, PRODUCTS } from './products'
import { STORE_IDS } from './stores'

/**
 * How each retailer prices a category relative to the reference shelf price.
 * Walmart leads on groceries, Costco on household and baby bulk, CVS is the
 * convenience premium. These ratios drive the whole demo price table.
 */
const CATEGORY_FACTOR: Record<StoreId, Record<Category, number>> = {
  walmart: { Groceries: 0.9, Household: 0.94, 'Baby & Kids': 0.95, 'Health & Pharmacy': 0.91 },
  amazon: { Groceries: 1.04, Household: 0.95, 'Baby & Kids': 0.93, 'Health & Pharmacy': 0.94 },
  costco: { Groceries: 0.96, Household: 0.88, 'Baby & Kids': 0.86, 'Health & Pharmacy': 0.9 },
  'dollar-general': { Groceries: 0.99, Household: 1.02, 'Baby & Kids': 1.06, 'Health & Pharmacy': 1.0 },
  cvs: { Groceries: 1.2, Household: 1.18, 'Baby & Kids': 1.15, 'Health & Pharmacy': 1.08 },
}

/** Products a retailer does not carry in this demo catalog. */
const NOT_CARRIED: Partial<Record<StoreId, string[]>> = {
  'dollar-general': ['chicken-breast', 'fresh-produce'],
  cvs: ['chicken-breast', 'apples', 'fresh-produce', 'rice'],
}

/** Hand-set prices so the documented demo scenarios stay exact. */
const OVERRIDES: Record<string, number> = {
  'peanut-butter@dollar-general': 3.7,
}

/** Advertised "was" prices used to test for misleading markdowns. */
const MARKDOWNS: Record<string, number> = {
  'milk@cvs': 6.99,
  'coffee@amazon': 15.49,
  'sunscreen@cvs': 12.99,
  'toilet-paper@walmart': 19.97,
  'eggs@dollar-general': 5.25,
}

/** Demo prices are shown as checked relative to when the app loaded. */
export const DEMO_REFERENCE_TIME = Date.now()

function buildQuote(productId: string, category: Category, storeId: StoreId): PriceQuote | null {
  if (NOT_CARRIED[storeId]?.includes(productId)) return null
  const key = `${productId}@${storeId}`
  const base = BASE_PRICES[productId]
  const noise = (seeded(key) - 0.5) * 0.06
  const price = OVERRIDES[key] ?? shelfPrice(base * CATEGORY_FACTOR[storeId][category] * (1 + noise))

  const stockRoll = seeded(`${key}:stock`)
  const availability: Availability = stockRoll < 0.1 ? 'low_stock' : 'in_stock'

  const minutesAgo = 12 + Math.floor(seeded(`${key}:time`) * 340)
  return {
    productId,
    storeId,
    price,
    previousPrice: MARKDOWNS[key] ?? null,
    availability,
    checkedAt: new Date(DEMO_REFERENCE_TIME - minutesAgo * 60_000).toISOString(),
    source: 'demo',
  }
}

export const PRICE_QUOTES: PriceQuote[] = PRODUCTS.flatMap((p) =>
  STORE_IDS.map((s) => buildQuote(p.id, p.category, s)).filter((q): q is PriceQuote => q !== null),
)

const QUOTE_MAP = new Map(PRICE_QUOTES.map((q) => [`${q.productId}@${q.storeId}`, q]))

export function getQuote(productId: string, storeId: StoreId): PriceQuote | undefined {
  return QUOTE_MAP.get(`${productId}@${storeId}`)
}

export function quotesFor(productId: string): PriceQuote[] {
  return PRICE_QUOTES.filter((q) => q.productId === productId && q.availability !== 'out_of_stock')
}

/** Cheapest available quote for a product. */
export function cheapestQuote(productId: string): PriceQuote | undefined {
  return [...quotesFor(productId)].sort((a, b) => a.price - b.price)[0]
}

/** Average shelf price across the retailers that carry the product. */
export function averagePrice(productId: string): number {
  const quotes = quotesFor(productId)
  if (quotes.length === 0) return 0
  return Math.round((quotes.reduce((sum, q) => sum + q.price, 0) / quotes.length) * 100) / 100
}
