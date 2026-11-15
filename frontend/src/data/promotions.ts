import type { Promotion, PromotionKind, StoreId } from '../types'
import { getQuote } from './prices'

interface PromotionSeed {
  id: string
  productId: string
  storeId: StoreId
  kind: PromotionKind
  title: string
  promoQuantity: number
  /** Total paid for `promoQuantity` units, or a function of the regular price. */
  promoTotal: number | ((regular: number) => number)
  conditions: string
}

const SEEDS: PromotionSeed[] = [
  { id: 'promo-pb', productId: 'peanut-butter', storeId: 'dollar-general', kind: 'multi_buy', title: 'Buy 3, save $2.00', promoQuantity: 3, promoTotal: (r) => r * 3 - 2, conditions: 'Digital coupon, must buy 3 in one transaction.' },
  { id: 'promo-detergent', productId: 'laundry-detergent', storeId: 'amazon', kind: 'multi_buy', title: '2 for $24.00', promoQuantity: 2, promoTotal: 24, conditions: 'Applied at checkout, ships with the next delivery.' },
  { id: 'promo-pasta', productId: 'pasta', storeId: 'dollar-general', kind: 'multi_buy', title: '5 for $7.00', promoQuantity: 5, promoTotal: 7, conditions: 'Mix and match Barilla shapes.' },
  { id: 'promo-snacks', productId: 'snacks', storeId: 'walmart', kind: 'multi_buy', title: '3 for $7.00', promoQuantity: 3, promoTotal: 7, conditions: 'In store only.' },
  { id: 'promo-coffee', productId: 'coffee', storeId: 'amazon', kind: 'multi_buy', title: '2 for $21.00', promoQuantity: 2, promoTotal: 21, conditions: 'Subscribe & Save, cancel anytime.' },
  { id: 'promo-diapers', productId: 'diapers', storeId: 'costco', kind: 'bulk', title: '2-pack bundle, $41.78', promoQuantity: 2, promoTotal: 41.78, conditions: 'Warehouse bundle, membership required.' },
  { id: 'promo-wipes', productId: 'baby-wipes', storeId: 'costco', kind: 'bulk', title: '2-pack bundle, $10.99', promoQuantity: 2, promoTotal: 10.99, conditions: 'Warehouse bundle, membership required.' },
  { id: 'promo-sunscreen', productId: 'sunscreen', storeId: 'cvs', kind: 'multi_buy', title: 'Buy 1, get 1 50% off', promoQuantity: 2, promoTotal: (r) => r * 1.5, conditions: 'ExtraCare card required.' },
  { id: 'promo-vitamins', productId: 'vitamins', storeId: 'cvs', kind: 'multi_buy', title: 'Buy 1, get 1 free', promoQuantity: 2, promoTotal: (r) => r, conditions: 'ExtraCare card required.' },
]

export const PROMOTIONS: Promotion[] = SEEDS.map((s) => {
  const quote = getQuote(s.productId, s.storeId)
  if (!quote) throw new Error(`Promotion ${s.id} references a product the store does not carry`)
  const promoTotal = typeof s.promoTotal === 'function' ? s.promoTotal(quote.price) : s.promoTotal
  return {
    id: s.id,
    productId: s.productId,
    storeId: s.storeId,
    kind: s.kind,
    title: s.title,
    regularPrice: quote.price,
    promoQuantity: s.promoQuantity,
    promoTotal: Math.round(promoTotal * 100) / 100,
    conditions: s.conditions,
  }
})

const BACKEND_PROMOTIONS = new Map<string, Promotion[]>()

export function registerBackendPromotions(productId: string, promotions: Promotion[]): void {
  BACKEND_PROMOTIONS.set(productId, promotions)
}

export function promotionsFor(productId: string): Promotion[] {
  return BACKEND_PROMOTIONS.get(productId) ?? PROMOTIONS.filter((p) => p.productId === productId)
}
