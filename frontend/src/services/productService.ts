import { PRICE_QUOTES, registerBackendQuotes } from '../data/prices'
import { PRODUCTS, registerBackendProducts } from '../data/products'
import { registerBackendPromotions } from '../data/promotions'
import type { Availability, Category, PriceQuote, ProductWithPrices, Promotion, StoreId } from '../types'
import { API_ENABLED, api, demoDelay, ENDPOINTS, type Sourced } from './api'

interface BackendProduct {
  id: number
  sku: string
  name: string
  brand: string
  category: 'GROCERIES' | 'HOUSEHOLD' | 'BABY_KIDS' | 'HEALTH_PHARMACY'
  packageSize: number
  packageUnit: string
}

interface BackendStore {
  id: number
  name: string
}

interface BackendOffer {
  productId: number
  storeId: number
  regularPrice: number
  loyaltyPrice: number | null
  buyQuantity: number
  freeQuantity: number
  availability: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  checkedAt: string | null
  sourceType: string
}

const storeNames: Record<string, StoreId> = {
  walmart: 'walmart',
  amazon: 'amazon',
  costco: 'costco',
  'dollar general': 'dollar-general',
  'cvs pharmacy': 'cvs',
}

const categories: Record<BackendProduct['category'], Category> = {
  GROCERIES: 'Groceries',
  HOUSEHOLD: 'Household',
  BABY_KIDS: 'Baby & Kids',
  HEALTH_PHARMACY: 'Health & Pharmacy',
}

const availability: Record<BackendOffer['availability'], Availability> = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
}

export function backendProductId(id: string): number | null {
  const match = /^backend:(\d+)$/.exec(id)
  return match ? Number(match[1]) : null
}

let pendingCatalog: Promise<ProductWithPrices[]> | null = null

async function fetchCatalog(): Promise<ProductWithPrices[]> {
  const [productsResponse, storesResponse] = await Promise.all([
    api.get<BackendProduct[]>(ENDPOINTS.products, { params: { limit: 100 } }),
    api.get<BackendStore[]>(ENDPOINTS.stores),
  ])
  const stores = new Map(storesResponse.data.map((store) => [store.id, storeNames[store.name.toLowerCase()]]))
  const offers = await Promise.all(
    productsResponse.data.map((product) =>
      api.get<BackendOffer[]>(ENDPOINTS.offers, { params: { productId: product.id } }),
    ),
  )
  const catalog: ProductWithPrices[] = productsResponse.data.map((product, index) => {
    const id = `backend:${product.id}`
    const quotes: PriceQuote[] = offers[index].data.flatMap((offer) => {
      const storeId = stores.get(offer.storeId)
      if (!storeId || offer.productId !== product.id) return []
      return [{
        productId: id,
        storeId,
        price: Number(offer.regularPrice),
        previousPrice: null,
        availability: availability[offer.availability],
        checkedAt: offer.checkedAt ? new Date(offer.checkedAt).toISOString() : new Date(0).toISOString(),
        source: offer.sourceType.toUpperCase() === 'DEMO' ? 'demo' : 'api',
      }]
    })
    const category = categories[product.category]
    return {
      id,
      name: product.name,
      brand: product.brand,
      variant: '',
      category,
      size: `${product.packageSize} ${product.packageUnit}`,
      perishable: category === 'Groceries' && /milk|egg|bread|banana|apple|chicken|yogurt/i.test(product.name),
      quotes,
    }
  })
  registerBackendProducts(catalog)
  for (const [index, product] of catalog.entries()) {
    registerBackendQuotes(product.id, product.quotes)
    const promos: Promotion[] = offers[index].data.flatMap((offer) => {
      const storeId = stores.get(offer.storeId)
      if (!storeId || offer.buyQuantity <= 0 || offer.freeQuantity <= 0) return []
      const quantity = offer.buyQuantity + offer.freeQuantity
      return [{
        id: `backend-offer:${offer.productId}:${storeId}`,
        productId: product.id,
        storeId,
        kind: 'multi_buy',
        title: `Buy ${offer.buyQuantity}, get ${offer.freeQuantity} free`,
        regularPrice: Number(offer.regularPrice),
        promoQuantity: quantity,
        promoTotal: Number((offer.buyQuantity * Number(offer.regularPrice)).toFixed(2)),
        conditions: 'Valid on complete bundles at the listed retailer.',
      }]
    })
    registerBackendPromotions(product.id, promos)
  }
  return catalog
}

export const productService = {
  async getProducts(): Promise<Sourced<ProductWithPrices[]>> {
    if (API_ENABLED) {
      try {
        if (!pendingCatalog) pendingCatalog = fetchCatalog().catch((error: unknown) => { pendingCatalog = null; throw error })
        return { data: await pendingCatalog, source: 'api' }
      } catch {
        pendingCatalog = null
      }
    }
    await demoDelay()
    return { data: PRODUCTS.map((p) => ({ ...p, quotes: PRICE_QUOTES.filter((q) => q.productId === p.id) })), source: 'demo' }
  },
}
