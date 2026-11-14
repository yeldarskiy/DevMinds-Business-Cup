import { simulatedReceiptItems } from '../data/receipts'
import type { ReceiptItem, ShoppingPlan, StoreId } from '../types'
import { API_ENABLED, api, demoDelay, ENDPOINTS } from './api'

export interface ScanResult {
  storeId: StoreId
  purchasedAt: string
  items: ReceiptItem[]
  /** True when the uploaded file was read by the backend OCR service. */
  processedByOcr: boolean
}

export const receiptService = {
  ocrAvailable: API_ENABLED,

  /** Sends the file to the backend OCR endpoint. */
  async upload(file: File): Promise<ScanResult> {
    const form = new FormData()
    form.append('file', file)
    const response = await api.post<Omit<ScanResult, 'processedByOcr'>>(ENDPOINTS.receiptUpload, form)
    return { ...response.data, processedByOcr: true }
  },

  /**
   * Demo OCR: without a backend the file is not read. It returns the receipt
   * the chosen store would print for the saved plan, clearly labeled in the UI.
   */
  async simulate(plan: ShoppingPlan): Promise<ScanResult> {
    await demoDelay(1500)
    return { storeId: plan.storeId, purchasedAt: new Date().toISOString(), items: simulatedReceiptItems(plan), processedByOcr: false }
  },
}
