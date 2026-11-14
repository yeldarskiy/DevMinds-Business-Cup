import type { CategorySpend, MonthlySpend, RetailerPerformance } from '../types'
import { DEMO_REFERENCE_TIME } from './prices'

/** Six months of household history for the demo family, oldest first. */
const MONTHLY_VALUES: Omit<MonthlySpend, 'month'>[] = [
  { spent: 548.2, saved: 24.1, verified: 15.3 },
  { spent: 536.9, saved: 29.4, verified: 20.2 },
  { spent: 561.3, saved: 33.2, verified: 25.8 },
  { spent: 529.6, saved: 38.5, verified: 30.1 },
  { spent: 512.4, saved: 44.2, verified: 35.4 },
  { spent: 520.0, saved: 48.0, verified: 39.0 },
]

function monthLabel(offset: number): string {
  const d = new Date(DEMO_REFERENCE_TIME)
  d.setDate(1)
  d.setMonth(d.getMonth() - offset)
  return d.toLocaleDateString('en-US', { month: 'short' })
}

export const MONTHLY_HISTORY: MonthlySpend[] = MONTHLY_VALUES.map((v, i) => ({ month: monthLabel(MONTHLY_VALUES.length - 1 - i), ...v }))

/** Current-month spending by category for the demo family. */
export const CATEGORY_HISTORY: CategorySpend[] = [
  { category: 'Groceries', amount: 312.4 },
  { category: 'Household', amount: 96.2 },
  { category: 'Baby & Kids', amount: 77.8 },
  { category: 'Health & Pharmacy', amount: 33.6 },
]

/** Current-month spending and savings by retailer for the demo family. */
export const RETAILER_HISTORY: RetailerPerformance[] = [
  { storeId: 'walmart', spent: 241.3, saved: 21.6, trips: 4 },
  { storeId: 'costco', spent: 148.9, saved: 14.2, trips: 1 },
  { storeId: 'dollar-general', spent: 61.4, saved: 6.1, trips: 2 },
  { storeId: 'amazon', spent: 46.2, saved: 4.3, trips: 2 },
  { storeId: 'cvs', spent: 22.2, saved: 1.8, trips: 1 },
]
