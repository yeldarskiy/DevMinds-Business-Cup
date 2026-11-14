import { AlertTriangle, RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Button } from './Button'

export function EmptyState({ icon, title, description, action, className }: { icon: ReactNode; title: string; description: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-canvas text-muted ring-1 ring-line">{icon}</div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry, className }: { message: string; onRetry: () => void; className?: string }) {
  return (
    <div role="alert" className={cn('flex flex-col items-center rounded-panel border border-danger-600/20 bg-danger-50 px-6 py-10 text-center', className)}>
      <AlertTriangle className="mb-3 size-6 text-danger-600" aria-hidden />
      <h3 className="text-base font-semibold text-ink">This section didn’t load</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
      <Button variant="secondary" className="mt-5" onClick={onRetry} icon={<RotateCw className="size-4" aria-hidden />}>
        Reload
      </Button>
    </div>
  )
}
