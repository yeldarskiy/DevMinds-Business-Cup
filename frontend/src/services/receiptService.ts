import { createWorker } from 'tesseract.js'
import { simulatedReceiptItems } from '../data/receipts'
import { storeName } from '../data/stores'
import type { ReceiptItem, ShoppingPlan, StoreId } from '../types'
import { API_ENABLED, api, demoDelay, ENDPOINTS } from './api'

interface BackendReceipt {
  id: string
  storeName: string
  lines: { description: string; price: number; matchedProductId: number | null }[]
  parsedTotal: number
}

export interface ScanResult {
  storeId: StoreId
  purchasedAt: string
  items: ReceiptItem[]
  processedByOcr: boolean
}

export const receiptService = {
  ocrAvailable: API_ENABLED,

  async upload(file: File, plan: ShoppingPlan): Promise<ScanResult> {
    if (!file.type.startsWith('image/')) throw new Error('Please upload a JPG or PNG image of your receipt.')
    if (file.size > 10 * 1024 * 1024) throw new Error('The receipt image must be 10 MB or smaller.')
    const worker = await createWorker('eng')
    let text: string
    try {
      const result = await worker.recognize(file)
      text = result.data.text.trim()
    } finally {
      await worker.terminate()
    }
    if (text.length < 5) throw new Error('No readable receipt text was detected. Try a clearer photo.')
    const response = await api.post<BackendReceipt>(ENDPOINTS.receiptAnalyze, {
      storeName: storeName(plan.storeId),
      receiptText: text.slice(0, 20000),
    }, { timeout: 25_000 })
    if (!Array.isArray(response.data.lines) || response.data.lines.length === 0) {
      throw new Error('The receipt had no recognizable product lines.')
    }
    const items: ReceiptItem[] = response.data.lines.map((line, index) => ({
      id: `${response.data.id}-${index}`,
      name: line.description,
      quantity: 1,
      price: Number(line.price),
      productId: line.matchedProductId == null ? null : `backend:${line.matchedProductId}`,
    }))
    return { storeId: plan.storeId, purchasedAt: new Date().toISOString(), items, processedByOcr: true }
  },

  async simulate(plan: ShoppingPlan): Promise<ScanResult> {
    await demoDelay(500)
    return {
      storeId: plan.storeId,
      purchasedAt: new Date().toISOString(),
      items: simulatedReceiptItems(plan),
      processedByOcr: false,
    }
  },
}
