import type { Store, StoreId } from '../types'

export const STORES: Store[] = [
  { id: 'walmart', name: 'Walmart', color: '#2563eb', requiresMembership: false, sameDayPickup: true },
  { id: 'amazon', name: 'Amazon', color: '#ea580c', requiresMembership: false, sameDayPickup: false },
  { id: 'costco', name: 'Costco', color: '#0f766e', requiresMembership: true, sameDayPickup: false },
  { id: 'dollar-general', name: 'Dollar General', color: '#a16207', requiresMembership: false, sameDayPickup: true },
  { id: 'cvs', name: 'CVS Pharmacy', color: '#be123c', requiresMembership: false, sameDayPickup: true },
]

export const STORE_IDS = STORES.map((s) => s.id)

const STORE_MAP = new Map(STORES.map((s) => [s.id, s]))

export function getStore(id: StoreId): Store {
  const store = STORE_MAP.get(id)
  if (!store) throw new Error(`Unknown store: ${id}`)
  return store
}

export function storeName(id: StoreId): string {
  return getStore(id).name
}
