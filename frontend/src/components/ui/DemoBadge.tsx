import { FlaskConical } from 'lucide-react'
import { cn } from '../../utils/cn'

/** Marks figures that come from the built-in sample dataset rather than live data. */
export function DemoBadge({ label = 'Demo data', className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full border border-dashed border-line-strong bg-surface px-2 py-0.5 text-[11px] font-medium text-muted', className)}
      title="Sample data for demonstration. Prices, stock and statistics are not live."
    >
      <FlaskConical className="size-3" aria-hidden />
      {label}
    </span>
  )
}
