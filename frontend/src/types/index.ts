export type StoreId = 'walmart' | 'amazon' | 'costco' | 'dollar-general' | 'cvs'

export interface Store {
  id: StoreId
  name: string
  /** Brand-neutral accent used for charts and store chips. */
  color: string
  requiresMembership: boolean
  /** Store offers same-day pickup for in-stock items. */
  sameDayPickup: boolean
}

export type Category = 'Groceries' | 'Household' | 'Baby & Kids' | 'Health & Pharmacy'

export type Availability = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface Product {
  id: string
  /** Generic product name shown first, e.g. "Milk". */
  name: string
  brand: string
  /** Variant description, e.g. "2% Reduced Fat". */
  variant: string
  category: Category
  /** Human readable package size, e.g. "52 fl oz". */
  size: string
  perishable: boolean
}

export interface PriceQuote {
  productId: string
  storeId: StoreId
  price: number
  /** Price shown on a "was" tag when the store advertises a markdown. */
  previousPrice: number | null
  availability: Availability
  /** ISO timestamp of when this price was last checked. */
  checkedAt: string
  source: DataSource
}

export type DataSource = 'demo' | 'api'

export interface ProductWithPrices extends Product {
  quotes: PriceQuote[]
}

export type PromotionKind = 'multi_buy' | 'bulk'

export interface Promotion {
  id: string
  productId: string
  storeId: StoreId
  kind: PromotionKind
  title: string
  regularPrice: number
  promoQuantity: number
  promoTotal: number
  conditions: string
}

export type DealVerdict = 'great' | 'good' | 'not_worth_it'

export interface DealAnalysis {
  verdict: DealVerdict
  regularUnitPrice: number
  promoUnitPrice: number
  requiredQuantity: number
  neededQuantity: number
  purchasedQuantity: number
  promoSpend: number
  regularSpendForNeed: number
  savingsVsRegular: number
  savingsPercent: number
  extraUnits: number
  extraSpend: number
  cheaperElsewhere: { storeId: StoreId; price: number } | null
  reasons: string[]
}

export interface BasketItem {
  productId: string
  quantity: number
}

/**
 * Resolved basket line used by the UI. `price` is the average shelf price
 * across the five retailers and `store` is the retailer with the lowest price.
 */
export interface BasketLine {
  id: string
  name: string
  category: Category
  quantity: number
  price: number
  store: StoreId
  lowestPrice: number
  product: Product
}

export type InsightSeverity = 'warning' | 'opportunity'

export type InsightKind = 'false_deal' | 'cheaper_elsewhere' | 'misleading_markdown' | 'excess_quantity' | 'good_deal' | 'bulk' | 'price_spread'

export interface BasketInsight {
  id: string
  kind: InsightKind
  severity: InsightSeverity
  productId: string
  title: string
  summary: string
  details: string[]
  /** Positive = extra cost, negative = saving. */
  costImpact: number
  recommendation: string
  /** Optional one-click fix the UI can apply to the basket. */
  fix: { label: string; quantity: number } | null
}

export interface BasketReport {
  productCount: number
  unitCount: number
  estimatedValue: number
  issues: BasketInsight[]
  opportunities: BasketInsight[]
  source: DataSource
}

export interface StoreLine {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
  averageUnitPrice: number
}

export interface StoreTotal {
  storeId: StoreId
  total: number
  lines: StoreLine[]
  missing: string[]
}

export interface SplitPlan {
  stores: [StoreId, StoreId]
  total: number
  tripCost: number
  savingsVsBest: number
  assignments: { productId: string; name: string; storeId: StoreId; lineTotal: number }[]
}

export interface OptimizeResult {
  baseline: number
  best: StoreTotal
  ranking: StoreTotal[]
  savings: number
  savingsPercent: number
  reasons: string[]
  split: SplitPlan | null
  convenience: { storeId: StoreId; total: number; extraCost: number; reason: string } | null
  source: DataSource
}

/** Snapshot saved when the shopper chooses a store, used to verify the receipt. */
export interface ShoppingPlan {
  storeId: StoreId
  predictedTotal: number
  baseline: number
  items: { productId: string; name: string; quantity: number; unitPrice: number }[]
  createdAt: string
}

export interface ReceiptItem {
  id: string
  name: string
  quantity: number
  price: number
  productId: string | null
}

export interface Receipt {
  id: string
  storeId: StoreId
  purchasedAt: string
  items: ReceiptItem[]
  total: number
  predictedTotal: number
  baseline: number
  verifiedSavings: number
  fileName: string | null
  source: DataSource
}

export interface MonthlySpend {
  month: string
  spent: number
  saved: number
  verified: number
}

export interface CategorySpend {
  category: Category
  amount: number
}

export interface RetailerPerformance {
  storeId: StoreId
  spent: number
  saved: number
  trips: number
}

export interface DashboardSummary {
  monthlySpending: number
  monthlySavings: number
  verifiedSavings: number
  shoppingScore: number
  monthly: MonthlySpend[]
  categories: CategorySpend[]
  retailers: RetailerPerformance[]
  source: DataSource
}
