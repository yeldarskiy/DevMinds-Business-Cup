import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { averagePrice, cheapestQuote } from '../data/prices'
import { DEMO_BASKET, getProduct } from '../data/products'
import type { BasketItem, BasketLine, Receipt, ShoppingPlan } from '../types'
import { round2 } from '../utils/format'
import { readStorage, writeStorage } from '../utils/storage'

const STORAGE_KEY = 'gimzup:v1'
const MAX_QUANTITY = 99

interface PersistedState {
  basket: BasketItem[]
  plan: ShoppingPlan | null
  receipts: Receipt[]
}

const EMPTY: PersistedState = { basket: [], plan: null, receipts: [] }

interface AppStateValue {
  basket: BasketItem[]
  basketLines: BasketLine[]
  /** Units across all lines. */
  unitCount: number
  /** Basket value at the average price across the five retailers. */
  estimatedValue: number
  plan: ShoppingPlan | null
  receipts: Receipt[]
  addToBasket: (productId: string, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  removeFromBasket: (productId: string) => void
  clearBasket: () => void
  loadDemoBasket: () => void
  savePlan: (plan: ShoppingPlan) => void
  saveReceipt: (receipt: Receipt) => void
  resetDemo: () => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

const clampQuantity = (q: number) => Math.max(1, Math.min(MAX_QUANTITY, Math.round(q)))

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => ({ ...EMPTY, ...readStorage<Partial<PersistedState>>(STORAGE_KEY, EMPTY) }))

  useEffect(() => {
    writeStorage(STORAGE_KEY, state)
  }, [state])

  const addToBasket = useCallback((productId: string, quantity = 1) => {
    setState((s) => {
      const existing = s.basket.find((i) => i.productId === productId)
      const basket = existing
        ? s.basket.map((i) => (i.productId === productId ? { ...i, quantity: clampQuantity(i.quantity + quantity) } : i))
        : [...s.basket, { productId, quantity: clampQuantity(quantity) }]
      return { ...s, basket }
    })
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setState((s) => ({ ...s, basket: s.basket.map((i) => (i.productId === productId ? { ...i, quantity: clampQuantity(quantity) } : i)) }))
  }, [])

  const removeFromBasket = useCallback((productId: string) => setState((s) => ({ ...s, basket: s.basket.filter((i) => i.productId !== productId) })), [])
  const clearBasket = useCallback(() => setState((s) => ({ ...s, basket: [] })), [])
  const loadDemoBasket = useCallback(() => setState((s) => ({ ...s, basket: DEMO_BASKET.map((i) => ({ ...i })) })), [])
  const savePlan = useCallback((plan: ShoppingPlan) => setState((s) => ({ ...s, plan })), [])
  const saveReceipt = useCallback((receipt: Receipt) => setState((s) => ({ ...s, receipts: [receipt, ...s.receipts] })), [])
  const resetDemo = useCallback(() => setState(EMPTY), [])

  const basketLines = useMemo<BasketLine[]>(
    () =>
      state.basket.flatMap((item) => {
        const product = getProduct(item.productId)
        const lowest = cheapestQuote(item.productId)
        if (!product || !lowest) return []
        return [
          {
            id: product.id,
            name: product.name,
            category: product.category,
            quantity: item.quantity,
            price: averagePrice(product.id),
            store: lowest.storeId,
            lowestPrice: lowest.price,
            product,
          },
        ]
      }),
    [state.basket],
  )

  const value = useMemo<AppStateValue>(
    () => ({
      basket: state.basket,
      basketLines,
      unitCount: basketLines.reduce((sum, l) => sum + l.quantity, 0),
      estimatedValue: round2(basketLines.reduce((sum, l) => sum + l.price * l.quantity, 0)),
      plan: state.plan,
      receipts: state.receipts,
      addToBasket,
      setQuantity,
      removeFromBasket,
      clearBasket,
      loadDemoBasket,
      savePlan,
      saveReceipt,
      resetDemo,
    }),
    [state, basketLines, addToBasket, setQuantity, removeFromBasket, clearBasket, loadDemoBasket, savePlan, saveReceipt, resetDemo],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider')
  return ctx
}
