import type { Category } from '../../types'

export const AXIS = { stroke: '#8a97ad', fontSize: 12, tickLine: false, axisLine: false } as const

export const TOOLTIP_STYLE = {
  contentStyle: { borderRadius: 10, border: '1px solid #e3e8f0', boxShadow: '0 8px 24px -8px rgb(15 30 61 / 0.18)', fontSize: 13, padding: '8px 12px' },
  labelStyle: { color: '#5b6b86', marginBottom: 4 },
  cursor: { fill: 'rgb(15 30 61 / 0.04)' },
} as const

export const CATEGORY_COLORS: Record<Category, string> = {
  Groceries: '#0f1e3d',
  Household: '#059669',
  'Baby & Kids': '#34d399',
  'Health & Pharmacy': '#8a97ad',
}
