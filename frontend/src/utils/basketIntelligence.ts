import { averagePrice, cheapestQuote, quotesFor } from '../data/prices'
import { getProduct } from '../data/products'
import { promotionsFor } from '../data/promotions'
import { storeName } from '../data/stores'
import type { BasketInsight, BasketItem, BasketReport } from '../types'
import { analyzeDeal } from './dealAnalyzer'
import { money, round2 } from './format'

/** Perishable quantities at or above this are flagged as a spoilage risk. */
const PERISHABLE_LIMIT = 4
const SUGGESTED_PERISHABLE_QTY = 2
/** Price gap between the cheapest and most expensive retailer worth pointing out. */
const SPREAD_THRESHOLD = 0.25
const MAX_SPREAD_INSIGHTS = 3

function pct(value: number): string {
  return `${Math.round(value * 100)}%`
}

/**
 * Basket Intelligence: inspects every line for misleading promotions, inflated
 * "was" prices and risky quantities, and surfaces genuine opportunities.
 * Every insight carries the reasoning and the cost impact behind it.
 */
export function analyzeBasket(items: BasketItem[]): BasketReport {
  const issues: BasketInsight[] = []
  const opportunities: BasketInsight[] = []
  const spreads: BasketInsight[] = []
  let estimatedValue = 0

  for (const item of items) {
    const product = getProduct(item.productId)
    if (!product) continue
    const qty = item.quantity
    const average = averagePrice(product.id)
    const cheapest = cheapestQuote(product.id)
    estimatedValue += average * qty

    for (const promo of promotionsFor(product.id)) {
      const a = analyzeDeal(promo, qty)
      const where = storeName(promo.storeId)
      if (a.verdict === 'not_worth_it' && a.extraUnits > 0) {
        issues.push({
          id: `${promo.id}:false`,
          kind: 'false_deal',
          severity: 'warning',
          productId: product.id,
          title: 'Potential false deal',
          summary: `${where}: ${product.name}, ${promo.title}`,
          details: [`To activate the promotion you must buy ${a.requiredQuantity}. You need ${a.neededQuantity}.`, ...a.reasons],
          costImpact: a.extraSpend,
          recommendation: `Skip this promotion and buy the ${a.neededQuantity} you need.`,
          fix: null,
        })
      } else if (a.verdict === 'not_worth_it' && a.cheaperElsewhere) {
        issues.push({
          id: `${promo.id}:beaten`,
          kind: 'cheaper_elsewhere',
          severity: 'warning',
          productId: product.id,
          title: 'Promotion beaten by an everyday price',
          summary: `${where}: ${product.name}, ${promo.title}`,
          details: a.reasons,
          costImpact: round2((a.promoUnitPrice - a.cheaperElsewhere.price) * a.neededQuantity),
          recommendation: `Buy it at ${storeName(a.cheaperElsewhere.storeId)} instead.`,
          fix: null,
        })
      } else if (a.verdict !== 'not_worth_it' && a.extraUnits === 0) {
        opportunities.push({
          id: `${promo.id}:deal`,
          kind: 'good_deal',
          severity: 'opportunity',
          productId: product.id,
          title: a.verdict === 'great' ? 'Genuine deal' : 'Worthwhile promotion',
          summary: `${where}: ${product.name}, ${promo.title}`,
          details: a.reasons,
          costImpact: -a.savingsVsRegular,
          recommendation: `Use this promotion if you shop at ${where}.`,
          fix: null,
        })
      } else if (a.verdict !== 'not_worth_it') {
        opportunities.push({
          id: `${promo.id}:stock`,
          kind: 'bulk',
          severity: 'opportunity',
          productId: product.id,
          title: promo.kind === 'bulk' ? 'Recommended bulk purchase' : 'Stock-up opportunity',
          summary: `${where}: ${product.name}, ${promo.title}`,
          details: a.reasons,
          costImpact: -a.savingsVsRegular,
          recommendation: `Worth it only if you'll use all ${a.requiredQuantity} before your next trip.`,
          fix: { label: `Set quantity to ${a.requiredQuantity}`, quantity: a.requiredQuantity },
        })
      }
    }

    for (const quote of quotesFor(product.id)) {
      if (!quote.previousPrice || !cheapest || quote.price <= average) continue
      issues.push({
        id: `${product.id}@${quote.storeId}:markdown`,
        kind: 'misleading_markdown',
        severity: 'warning',
        productId: product.id,
        title: 'Misleading sale tag',
        summary: `${storeName(quote.storeId)}: ${product.name}, was ${money(quote.previousPrice)}, now ${money(quote.price)}`,
        details: [
          `The "sale" price is still ${pct(quote.price / average - 1)} above the average across all five retailers.`,
          `${storeName(cheapest.storeId)} sells it for ${money(cheapest.price)} every day, ${pct(quote.price / cheapest.price - 1)} less than the sale price.`,
        ],
        costImpact: round2((quote.price - cheapest.price) * qty),
        recommendation: `Ignore the sale tag. The everyday price at ${storeName(cheapest.storeId)} is lower.`,
        fix: null,
      })
    }

    if (product.perishable && qty >= PERISHABLE_LIMIT) {
      issues.push({
        id: `${product.id}:quantity`,
        kind: 'excess_quantity',
        severity: 'warning',
        productId: product.id,
        title: 'Large quantity of a perishable item',
        summary: `${product.name}: ${qty} units in one trip`,
        details: [`${product.name} spoils within about a week. Families typically use ${SUGGESTED_PERISHABLE_QTY} per trip.`],
        costImpact: round2(average * (qty - SUGGESTED_PERISHABLE_QTY)),
        recommendation: `Reduce to ${SUGGESTED_PERISHABLE_QTY} unless you'll use them before they spoil.`,
        fix: { label: `Reduce to ${SUGGESTED_PERISHABLE_QTY}`, quantity: SUGGESTED_PERISHABLE_QTY },
      })
    }

    const quotes = quotesFor(product.id)
    if (quotes.length > 1 && cheapest) {
      const highest = quotes.reduce((max, q) => (q.price > max.price ? q : max))
      const spread = highest.price / cheapest.price - 1
      if (spread >= SPREAD_THRESHOLD) {
        spreads.push({
          id: `${product.id}:spread`,
          kind: 'price_spread',
          severity: 'opportunity',
          productId: product.id,
          title: 'Large price gap between retailers',
          summary: `${product.name}: ${money(cheapest.price)} to ${money(highest.price)}`,
          details: [`${storeName(highest.storeId)} charges ${pct(spread)} more than ${storeName(cheapest.storeId)} for the same item.`],
          costImpact: -round2((average - cheapest.price) * qty),
          recommendation: 'The optimizer accounts for this when choosing your store.',
          fix: null,
        })
      }
    }
  }

  spreads.sort((a, b) => a.costImpact - b.costImpact)
  opportunities.push(...spreads.slice(0, MAX_SPREAD_INSIGHTS))
  issues.sort((a, b) => b.costImpact - a.costImpact)

  return {
    productCount: items.length,
    unitCount: items.reduce((sum, i) => sum + i.quantity, 0),
    estimatedValue: round2(estimatedValue),
    issues,
    opportunities,
    source: 'demo',
  }
}
