import type { DashboardSummary, Receipt } from '../types'
import { buildDashboard } from '../utils/dashboard'
import { demoDelay, ENDPOINTS, withFallback, type Sourced } from './api'

export const dashboardService = {
  async getSummary(receipts: Receipt[]): Promise<Sourced<DashboardSummary>> {
    return withFallback(
      { url: ENDPOINTS.dashboard },
      async () => {
        await demoDelay(300)
        return buildDashboard(receipts)
      },
      (d) => typeof d === 'object' && d !== null && Array.isArray((d as DashboardSummary).monthly),
    )
  },
}
