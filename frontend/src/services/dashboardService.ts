import type { DashboardSummary, Receipt } from '../types'
import { buildDashboard } from '../utils/dashboard'
import { API_ENABLED, demoDelay, type Sourced } from './api'

export const dashboardService = {
  async getSummary(receipts: Receipt[]): Promise<Sourced<DashboardSummary>> {
    await demoDelay(120)
    const source = API_ENABLED ? 'api' : 'demo'
    const result = buildDashboard(receipts, new Date(), !API_ENABLED)
    return { data: { ...result, source }, source }
  },
}
