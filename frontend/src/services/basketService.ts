import type { BasketItem, BasketReport, OptimizeResult, SplitPlan, StoreId, StoreLine, StoreTotal } from '../types'
import { getProduct } from '../data/products'
import { averagePrice } from '../data/prices'
import { analyzeBasket } from '../utils/basketIntelligence'
import { optimizeBasket } from '../utils/optimizer'
import { money, round2 } from '../utils/format'
import { API_ENABLED, api, demoDelay, ENDPOINTS, type Sourced } from './api'
import { backendProductId } from './productService'

interface BackendAllocation {
  productId: number
  productName: string
  storeName: string
  quantity: number
  lineTotal: number
}
interface BackendPlan {
  storeNames: string[]
  items: BackendAllocation[]
  tripCost: number
  total: number
}
interface BackendOptimizeResult {
  recommended: BackendPlan
  alternatives: BackendPlan[]
  cheapestSingleStore: number
  estimatedSavings: number
  note: string
}

const storeIds: Record<string, StoreId> = {
  walmart: 'walmart',
  amazon: 'amazon',
  costco: 'costco',
  'dollar general': 'dollar-general',
  'cvs pharmacy': 'cvs',
}

function storeId(name: string): StoreId | null {
  return storeIds[name.toLowerCase()] ?? null
}

function fromPlan(plan: BackendPlan): StoreTotal | null {
  if (plan.storeNames.length !== 1) return null
  const store = storeId(plan.storeNames[0])
  if (!store) return null
  const lines: StoreLine[] = plan.items.map((item) => {
    const id = `backend:${item.productId}`
    const product = getProduct(id)
    return {
      productId: id,
      name: product?.name ?? item.productName,
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
      unitPrice: round2(Number(item.lineTotal) / item.quantity),
      averageUnitPrice: averagePrice(id),
    }
  })
  return { storeId: store, total: Number(plan.total), lines, missing: [] }
}

function fromSplit(plan: BackendPlan, single: StoreTotal): SplitPlan | null {
  if (plan.storeNames.length !== 2 || Number(plan.total) >= single.total) return null
  const stores = plan.storeNames.map(storeId)
  if (!stores[0] || !stores[1]) return null
  const assignments = plan.items.flatMap((line) => {
    const store = storeId(line.storeName)
    if (!store) return []
    return [{ productId: `backend:${line.productId}`, name: line.productName, storeId: store, lineTotal: Number(line.lineTotal) }]
  })
  return {
    stores: [stores[0], stores[1]],
    total: Number(plan.total),
    tripCost: Number(plan.tripCost),
    savingsVsBest: round2(single.total - Number(plan.total)),
    assignments,
  }
}

export const basketService = {
  async analyze(items: BasketItem[]): Promise<Sourced<BasketReport>> {
    await demoDelay(150)
    const result = analyzeBasket(items)
    const source = API_ENABLED && items.every((item) => backendProductId(item.productId) !== null) ? 'api' : 'demo'
    return { data: { ...result, source }, source }
  },

  async optimize(items: BasketItem[]): Promise<Sourced<OptimizeResult>> {
    if (API_ENABLED && items.length > 0 && items.every((item) => backendProductId(item.productId) !== null)) {
      const data = {
        items: items.map((item) => ({ productId: backendProductId(item.productId), quantity: item.quantity })),
        additionalStoreCost: 4.5,
        loyaltyMember: false,
        maxStores: 1,
      }
      const singleResponse = await api.post<BackendOptimizeResult>(ENDPOINTS.basketOptimize, data)
      const single = fromPlan(singleResponse.data.recommended)
      if (!single) throw new Error('No complete one-store basket is available.')
      const ranking = [singleResponse.data.recommended, ...singleResponse.data.alternatives]
        .map(fromPlan)
        .filter((plan): plan is StoreTotal => plan !== null)
        .filter((plan, index, all) => all.findIndex((other) => other.storeId === plan.storeId) === index)
        .sort((left, right) => left.total - right.total)
      const baseline = round2(items.reduce((sum, item) => sum + averagePrice(item.productId) * item.quantity, 0))
      let split: SplitPlan | null = null
      try {
        const multiResponse = await api.post<BackendOptimizeResult>(ENDPOINTS.basketOptimize, { ...data, maxStores: 2 })
        split = fromSplit(multiResponse.data.recommended, single)
      } catch {
        split = null
      }
      const savings = round2(Math.max(0, baseline - single.total))
      const reasons = [
        `Best complete one-store basket: ${money(single.total)} at sample catalog prices.`,
        `Compared with the listed-store average of ${money(baseline)}.`,
        singleResponse.data.note,
      ]
      const result: OptimizeResult = {
        baseline,
        best: single,
        ranking: ranking.length ? ranking : [single],
        savings,
        savingsPercent: baseline > 0 ? round2((savings / baseline) * 100) : 0,
        reasons,
        split,
        convenience: null,
        source: 'api',
      }
      return { data: result, source: 'api' }
    }
    await demoDelay(250)
    return { data: optimizeBasket(items), source: 'demo' }
  },
}
