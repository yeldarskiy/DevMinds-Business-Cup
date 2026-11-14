import axios, { type AxiosRequestConfig } from 'axios'

const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? ''

/** True when a backend URL is configured. Without it the app runs on the built-in demo dataset. */
export const API_ENABLED = baseURL.length > 0

export const api = axios.create({
  baseURL: API_ENABLED ? baseURL.replace(/\/$/, '') : undefined,
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

/** Every backend path the frontend uses lives here, so UI code never hardcodes URLs. */
export const ENDPOINTS = {
  products: '/api/products',
  basketAnalyze: '/api/basket/analyze',
  basketOptimize: '/api/basket/optimize',
  receiptUpload: '/api/receipts/upload',
  dashboard: '/api/dashboard',
} as const

export interface Sourced<T> {
  data: T
  source: 'api' | 'demo'
}

/**
 * Calls the backend when one is configured and falls back to the demo dataset
 * when it isn't, when the request fails, or when the response doesn't match the
 * frontend contract in `src/types`. The returned `source` lets the UI label
 * demo data honestly.
 */
export async function withFallback<T>(
  config: AxiosRequestConfig,
  demo: () => T | Promise<T>,
  isValid: (data: unknown) => boolean = (data) => data !== null && data !== undefined,
): Promise<Sourced<T>> {
  if (API_ENABLED) {
    try {
      const response = await api.request<T>(config)
      if (isValid(response.data)) return { data: response.data, source: 'api' }
    } catch {
      return { data: await demo(), source: 'demo' }
    }
  }
  return { data: await demo(), source: 'demo' }
}

/** Short artificial latency so loading states are visible with the demo dataset. */
export function demoDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Try again.'
    if (!error.response) return 'Could not reach the GIMZUP server. Check your connection and try again.'
    return `The server returned an error (${error.response.status}). Try again in a moment.`
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong. Try again.'
}
