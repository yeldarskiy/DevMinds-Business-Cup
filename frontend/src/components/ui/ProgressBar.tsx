import { cn } from '../../utils/cn'

interface ProgressBarProps {
  value: number
  max: number
  label: string
  tone?: 'brand' | 'caution' | 'danger' | 'ink'
  className?: string
}

const toneClass = { brand: 'bg-brand-600', caution: 'bg-caution-600', danger: 'bg-danger-600', ink: 'bg-ink' }

export function ProgressBar({ value, max, label, tone = 'brand', className }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-line', className)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500', toneClass[tone])} style={{ width: `${pct}%` }} />
    </div>
  )
}
