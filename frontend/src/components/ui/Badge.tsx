import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export type BadgeTone = 'neutral' | 'brand' | 'caution' | 'danger' | 'ink'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-canvas text-ink-soft ring-line',
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  caution: 'bg-caution-50 text-caution-600 ring-caution-600/25',
  danger: 'bg-danger-50 text-danger-600 ring-danger-600/25',
  ink: 'bg-ink text-white ring-ink',
}

export function Badge({ tone = 'neutral', icon, className, children }: { tone?: BadgeTone; icon?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', tones[tone], className)}>
      {icon}
      {children}
    </span>
  )
}
