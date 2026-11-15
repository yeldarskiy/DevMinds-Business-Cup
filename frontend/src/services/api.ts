import axios from 'axios'

const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
const baseURL = configured === undefined ? '/' : configured

export const API_ENABLED = (import.meta.env.VITE_USE_DEMO as string | undefined) !== 'true' && baseURL.length > 0

export const api = axios.create({
  baseURL: API_ENABLED ? baseURL.replace(/\/$/, '') || '/' : undefined,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

export const ENDPOINTS = {
  products: '/api/products',
  offers: '/api/offers',
  stores: '/api/stores',
  basketOptimize: '/api/cart/optimize',
  receiptAnalyze: '/api/receipts/analyze',
} as const

export interface Sourced<T> {
  data: T
  source: 'api' | 'demo'
}

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
