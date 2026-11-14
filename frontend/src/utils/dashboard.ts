import { CATEGORY_HISTORY, MONTHLY_HISTORY, RETAILER_HISTORY } from '../data/history'
import { getProduct } from '../data/products'
import type { DashboardSummary, Receipt } from '../types'
import { round2 } from './format'

/** Savings rate at which the savings half of the score maxes out. */
const TARGET_SAVINGS_RATE = 0.12

/**
 * Smart Shopping Score (0–100): 20 base points, up to 45 for the share of
 * spending saved and up to 35 for how much of those savings receipts verified.
 */
function shoppingScore(spent: number, saved: number, verified: number): number {
  if (spent <= 0) return 0
  const rate = Math.min(1, saved / spent / TARGET_SAVINGS_RATE)
  const verifiedShare = saved > 0 ? Math.min(1, verified / saved) : 0
  return Math.round(20 + 45 * rate + 35 * verifiedShare)
}

function isCurrentMonth(iso: string, now: Date): boolean {
  const d = new Date(iso)
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

/** Combines the demo household history with receipts verified in this session. */
export function buildDashboard(receipts: Receipt[], now = new Date()): DashboardSummary {
  const recent = receipts.filter((r) => isCurrentMonth(r.purchasedAt, now))
  const monthly = MONTHLY_HISTORY.map((m) => ({ ...m }))
  const categories = CATEGORY_HISTORY.map((c) => ({ ...c }))
  const retailers = RETAILER_HISTORY.map((r) => ({ ...r }))
  const current = monthly[monthly.length - 1]

  for (const r of recent) {
    current.spent = round2(current.spent + r.total)
    current.saved = round2(current.saved + r.verifiedSavings)
    current.verified = round2(current.verified + r.verifiedSavings)
    for (const item of r.items) {
      const category = (item.productId && getProduct(item.productId)?.category) || 'Groceries'
      const row = categories.find((c) => c.category === category)
      if (row) row.amount = round2(row.amount + item.price * item.quantity)
    }
    const retailer = retailers.find((x) => x.storeId === r.storeId)
    if (retailer) {
      retailer.spent = round2(retailer.spent + r.total)
      retailer.saved = round2(retailer.saved + r.verifiedSavings)
      retailer.trips += 1
    }
  }

  retailers.sort((a, b) => b.saved - a.saved)
  return {
    monthlySpending: current.spent,
    monthlySavings: current.saved,
    verifiedSavings: current.verified,
    shoppingScore: shoppingScore(current.spent, current.saved, current.verified),
    monthly,
    categories,
    retailers,
    source: 'demo',
  }
}
