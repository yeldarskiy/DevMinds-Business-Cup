import type { Availability } from '../../types'
import { cn } from '../../utils/cn'
import { relativeTime } from '../../utils/format'

const LABEL: Record<Availability, string> = { in_stock: 'In stock', low_stock: 'Low stock', out_of_stock: 'Out of stock' }
const DOT: Record<Availability, string> = { in_stock: 'bg-brand-500', low_stock: 'bg-caution-600', out_of_stock: 'bg-danger-600' }

export function AvailabilityTag({ availability, checkedAt, className }: { availability: Availability; checkedAt?: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted', className)}>
      <span className={cn('size-1.5 rounded-full', DOT[availability])} aria-hidden />
      <span className={availability === 'out_of_stock' ? 'text-danger-600' : undefined}>{LABEL[availability]}</span>
      {checkedAt && <span className="text-faint">checked {relativeTime(checkedAt)}</span>}
    </span>
  )
}
