import type { BasketItem, BasketReport, OptimizeResult } from '../types'
import { analyzeBasket } from '../utils/basketIntelligence'
import { optimizeBasket } from '../utils/optimizer'
import { demoDelay, ENDPOINTS, withFallback, type Sourced } from './api'

export const basketService = {
  async analyze(items: BasketItem[]): Promise<Sourced<BasketReport>> {
    const result = await withFallback<BasketReport>(
      { url: ENDPOINTS.basketAnalyze, method: 'POST', data: { items } },
      async () => {
        await demoDelay(600)
        return analyzeBasket(items)
      },
      (d) => typeof d === 'object' && d !== null && Array.isArray((d as BasketReport).issues),
    )
    return { ...result, data: { ...result.data, source: result.source } }
  },

  async optimize(items: BasketItem[]): Promise<Sourced<OptimizeResult>> {
    const result = await withFallback<OptimizeResult>(
      { url: ENDPOINTS.basketOptimize, method: 'POST', data: { items } },
      async () => {
        await demoDelay(800)
        return optimizeBasket(items)
      },
      (d) => typeof d === 'object' && d !== null && Array.isArray((d as OptimizeResult).ranking),
    )
    return { ...result, data: { ...result.data, source: result.source } }
  },
}
