import { PRICE_QUOTES } from '../data/prices'
import { PRODUCTS } from '../data/products'
import type { ProductWithPrices } from '../types'
import { demoDelay, ENDPOINTS, withFallback, type Sourced } from './api'

const isProductList = (data: unknown) =>
  Array.isArray(data) && data.every((p) => typeof p === 'object' && p !== null && Array.isArray((p as ProductWithPrices).quotes))

export const productService = {
  async getProducts(): Promise<Sourced<ProductWithPrices[]>> {
    return withFallback(
      { url: ENDPOINTS.products },
      async () => {
        await demoDelay()
        return PRODUCTS.map((p) => ({ ...p, quotes: PRICE_QUOTES.filter((q) => q.productId === p.id) }))
      },
      isProductList,
    )
  },
}
