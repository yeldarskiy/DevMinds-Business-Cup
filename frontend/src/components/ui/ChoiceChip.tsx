import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface ChoiceChipProps {
  selected: boolean
  onToggle: () => void
  children: ReactNode
  leading?: ReactNode
  disabled?: boolean
}

/** Toggleable chip used for multi-select filters and preferences. */
export function ChoiceChip({ selected, onToggle, children, leading, disabled }: ChoiceChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors disabled:opacity-50',
        selected ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-line-strong bg-surface text-ink-soft hover:border-faint',
      )}
    >
      {selected ? <Check className="size-3.5" aria-hidden /> : leading}
      {children}
    </button>
  )
}
