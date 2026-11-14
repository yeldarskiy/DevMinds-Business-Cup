import { Minus, Plus } from 'lucide-react'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  label: string
  min?: number
  max?: number
}

export function QuantityStepper({ value, onChange, label, min = 1, max = 99 }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-control border border-line-strong bg-surface" role="group" aria-label={`Quantity for ${label}`}>
      <button
        type="button"
        className="flex size-11 items-center justify-center text-ink-soft hover:text-ink disabled:opacity-35"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease quantity of ${label}`}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="tnum w-7 text-center text-sm font-semibold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="flex size-11 items-center justify-center text-ink-soft hover:text-ink disabled:opacity-35"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  )
}
