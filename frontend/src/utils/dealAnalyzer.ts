import { getProduct } from '../data/products'
import { quotesFor } from '../data/prices'
import { storeName } from '../data/stores'
import type { DealAnalysis, DealVerdict, Promotion } from '../types'
import { money, round2 } from './format'

/** Minimum discount that makes stocking up on a non-perishable worth it. */
const STOCK_UP_THRESHOLD: Record<Promotion['kind'], number> = { multi_buy: 20, bulk: 12 }

/**
 * Deterministic promotion check against the quantity the household needs.
 * The promotion only applies in full bundles; anything beyond the last bundle
 * is charged at the regular price.
 */
export function analyzeDeal(promo: Promotion, neededQuantity: number): DealAnalysis {
  const perishable = getProduct(promo.productId)?.perishable ?? false
  const need = Math.max(1, Math.floor(neededQuantity))
  const regular = promo.regularPrice
  const promoUnit = round2(promo.promoTotal / promo.promoQuantity)

  const bundles = Math.max(1, Math.floor(need / promo.promoQuantity))
  const remainder = need >= promo.promoQuantity ? need - bundles * promo.promoQuantity : 0
  const purchased = need >= promo.promoQuantity ? need : promo.promoQuantity
  const promoSpend = round2(bundles * promo.promoTotal + remainder * regular)
  const regularForNeed = round2(need * regular)
  const regularForPurchased = round2(purchased * regular)
  const savingsVsRegular = round2(regularForPurchased - promoSpend)
  const savingsPercent = regularForPurchased > 0 ? round2((savingsVsRegular / regularForPurchased) * 100) : 0
  const extraUnits = purchased - need
  const extraSpend = round2(promoSpend - regularForNeed)

  const competitor = quotesFor(promo.productId)
    .filter((q) => q.storeId !== promo.storeId)
    .sort((a, b) => a.price - b.price)[0]
  const cheaperElsewhere = competitor && competitor.price < promoUnit ? { storeId: competitor.storeId, price: competitor.price } : null

  const reasons: string[] = []
  let verdict: DealVerdict

  if (extraUnits === 0) {
    verdict = savingsPercent >= 20 ? 'great' : savingsPercent >= 8 ? 'good' : 'not_worth_it'
    reasons.push(`You need ${need}, and the promotion covers them at ${money(promoUnit)} each instead of ${money(regular)}.`)
    reasons.push(`That saves ${money(savingsVsRegular)} (${savingsPercent.toFixed(0)}%) compared with the regular price at ${storeName(promo.storeId)}.`)
    if (remainder > 0) reasons.push(`${remainder} of them fall outside a full bundle and are charged at the regular price.`)
  } else if (extraSpend <= 0) {
    verdict = 'great'
    reasons.push(`The promotion adds ${extraUnits} extra at no additional cost: you pay ${money(promoSpend)}, the same as ${need} at the regular price.`)
  } else if (!perishable && savingsPercent >= STOCK_UP_THRESHOLD[promo.kind]) {
    verdict = 'good'
    reasons.push(`You need ${need}, but the promotion requires ${promo.promoQuantity}. Today's bill goes up by ${money(extraSpend)}.`)
    reasons.push(`It keeps well and the per-unit price drops ${savingsPercent.toFixed(0)}%, so it pays off if you'll use the extra ${extraUnits} before your next trip.`)
  } else {
    verdict = 'not_worth_it'
    reasons.push(`You need ${need}, but the promotion requires ${promo.promoQuantity}. It increases spending by ${money(extraSpend)} for items you didn't plan to buy.`)
    reasons.push(perishable ? 'It spoils quickly, so the extra units are likely to go to waste.' : `The ${savingsPercent.toFixed(0)}% per-unit discount doesn't justify the extra spend.`)
  }

  if (cheaperElsewhere) {
    verdict = 'not_worth_it'
    reasons.push(`${storeName(cheaperElsewhere.storeId)} sells it for ${money(cheaperElsewhere.price)} every day, below the promotional ${money(promoUnit)} per unit.`)
  }

  return {
    verdict,
    regularUnitPrice: regular,
    promoUnitPrice: promoUnit,
    requiredQuantity: promo.promoQuantity,
    neededQuantity: need,
    purchasedQuantity: purchased,
    promoSpend,
    regularSpendForNeed: regularForNeed,
    savingsVsRegular,
    savingsPercent,
    extraUnits,
    extraSpend,
    cheaperElsewhere,
    reasons,
  }
}
