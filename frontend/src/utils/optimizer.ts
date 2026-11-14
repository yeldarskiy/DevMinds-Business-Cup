import { averagePrice, getQuote } from '../data/prices'
import { getProduct } from '../data/products'
import { getStore, storeName, STORE_IDS } from '../data/stores'
import type { BasketItem, OptimizeResult, SplitPlan, StoreId, StoreLine, StoreTotal } from '../types'
import { money, round2 } from './format'

/** Estimated cost of a second stop (fuel and time) used for split plans. */
const EXTRA_TRIP_COST = 4.5
/** A split plan must beat the best single store by at least this much to be suggested. */
const SPLIT_MIN_GAIN = 1

function storeTotal(items: BasketItem[], storeId: StoreId): StoreTotal {
  const lines: StoreLine[] = []
  const missing: string[] = []
  for (const item of items) {
    const product = getProduct(item.productId)
    if (!product) continue
    const quote = getQuote(item.productId, storeId)
    if (!quote || quote.availability === 'out_of_stock') {
      missing.push(product.name)
      continue
    }
    lines.push({
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      unitPrice: quote.price,
      lineTotal: round2(quote.price * item.quantity),
      averageUnitPrice: averagePrice(product.id),
    })
  }
  return { storeId, lines, missing, total: round2(lines.reduce((s, l) => s + l.lineTotal, 0)) }
}

/** Average-price value of the lines a store can supply. */
function coveredBaseline(t: StoreTotal): number {
  return round2(t.lines.reduce((s, l) => s + l.averageUnitPrice * l.quantity, 0))
}

function bestSplit(items: BasketItem[], best: StoreTotal): SplitPlan | null {
  let winner: SplitPlan | null = null
  for (let i = 0; i < STORE_IDS.length; i++) {
    for (let j = i + 1; j < STORE_IDS.length; j++) {
      const pair: [StoreId, StoreId] = [STORE_IDS[i], STORE_IDS[j]]
      const assignments: SplitPlan['assignments'] = []
      let complete = true
      for (const item of items) {
        const product = getProduct(item.productId)
        if (!product) continue
        const options = pair
          .map((s) => ({ s, q: getQuote(item.productId, s) }))
          .filter((o) => o.q && o.q.availability !== 'out_of_stock')
          .sort((a, b) => (a.q?.price ?? 0) - (b.q?.price ?? 0))
        const pick = options[0]
        if (!pick?.q) {
          complete = false
          break
        }
        assignments.push({ productId: product.id, name: product.name, storeId: pick.s, lineTotal: round2(pick.q.price * item.quantity) })
      }
      if (!complete || !pair.every((s) => assignments.some((a) => a.storeId === s))) continue
      const total = round2(assignments.reduce((s, a) => s + a.lineTotal, 0) + EXTRA_TRIP_COST)
      const savingsVsBest = round2(best.total - total)
      if (savingsVsBest >= SPLIT_MIN_GAIN && (!winner || total < winner.total)) {
        winner = { stores: pair, total, tripCost: EXTRA_TRIP_COST, savingsVsBest, assignments }
      }
    }
  }
  return best.missing.length > 0 ? null : winner
}

/**
 * Compares the whole basket at each retailer, picks the cheapest complete
 * basket and explains the decision in plain language.
 */
export function optimizeBasket(items: BasketItem[]): OptimizeResult {
  if (items.length === 0) throw new Error('Add at least one product before optimizing.')

  const ranking = STORE_IDS.map((s) => storeTotal(items, s))
    .filter((t) => t.lines.length > 0)
    .sort((a, b) => a.missing.length - b.missing.length || a.total - b.total)
  const best = ranking[0]
  if (!best) throw new Error('None of the retailers carry these products.')

  const baseline = round2(items.reduce((s, i) => s + averagePrice(i.productId) * i.quantity, 0))
  const comparable = coveredBaseline(best)
  const savings = round2(Math.max(0, comparable - best.total))
  const savingsPercent = comparable > 0 ? round2((savings / comparable) * 100) : 0
  const name = storeName(best.storeId)
  const store = getStore(best.storeId)

  const reasons: string[] = []
  const cheaperLines = best.lines
    .map((l) => ({ l, pct: ((l.averageUnitPrice - l.unitPrice) / l.averageUnitPrice) * 100 }))
    .filter((x) => x.pct >= 3)
    .sort((a, b) => b.pct - a.pct)
  for (const { l, pct } of cheaperLines.slice(0, 3)) {
    reasons.push(`${l.name}: ${pct.toFixed(0)}% below the five-retailer average (${money(l.unitPrice)} vs ${money(l.averageUnitPrice)}).`)
  }
  const runnerUp = ranking.find((t) => t !== best && t.missing.length === best.missing.length)
  if (runnerUp) {
    reasons.push(`Lowest total of all retailers: ${money(round2(runnerUp.total - best.total))} less than ${storeName(runnerUp.storeId)}, the next best option.`)
  }
  if (best.missing.length > 0) reasons.push(`${name} doesn't carry ${best.missing.join(', ')}. No single retailer carries everything on your list.`)
  else reasons.push(`Carries all ${best.lines.length} products, so one trip covers the whole list.`)
  if (store.requiresMembership) reasons.push('Requires a Costco membership. The annual fee is not included in this total.')
  if (store.sameDayPickup) reasons.push('Same-day pickup is available.')

  const healthUnits = items.reduce((s, i) => s + (getProduct(i.productId)?.category === 'Health & Pharmacy' ? i.quantity : 0), 0)
  const allUnits = items.reduce((s, i) => s + i.quantity, 0)
  const cvs = ranking.find((t) => t.storeId === 'cvs')
  const convenience =
    best.storeId !== 'cvs' && cvs && cvs.missing.length === 0 && healthUnits / allUnits >= 0.5
      ? {
          storeId: cvs.storeId,
          total: cvs.total,
          extraCost: round2(cvs.total - best.total),
          reason: 'Best convenience option: pharmacy counter on site and pickup available today.',
        }
      : null

  return { baseline, best, ranking, savings, savingsPercent, reasons, split: bestSplit(items, best), convenience, source: 'demo' }
}
