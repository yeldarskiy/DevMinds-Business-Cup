import { getProduct } from './products'
import type { ReceiptItem, ShoppingPlan } from '../types'
import { seeded } from '../utils/seed'

function receiptLabel(productId: string, fallback: string): string {
  const product = getProduct(productId)
  const label = product ? `${product.brand} ${product.name}` : fallback
  return label.toUpperCase().replace(/[^A-Z0-9 &%.]/g, '').slice(0, 24)
}

/**
 * Demo OCR output: the line items a store would print for this plan. Some
 * items ring up slightly differently at the register (in-store rollbacks or
 * a price change since the last check), which is what verification catches.
 */
export function simulatedReceiptItems(plan: ShoppingPlan): ReceiptItem[] {
  return plan.items.map((item, i) => {
    const roll = seeded(`${item.productId}:${plan.createdAt}:register`)
    const factor = roll < 0.3 ? 1 - (0.03 + seeded(`${item.productId}:${plan.createdAt}:depth`) * 0.05) : roll > 0.92 ? 1.02 : 1
    return {
      id: `line-${i}`,
      name: receiptLabel(item.productId, item.name),
      quantity: item.quantity,
      price: Math.round(item.unitPrice * factor * 100) / 100,
      productId: item.productId,
    }
  })
}
