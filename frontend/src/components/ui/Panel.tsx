import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  padded?: boolean
  as?: 'section' | 'div' | 'article'
}

export function Panel({ title, description, action, padded = true, as: Tag = 'section', className, children, ...rest }: PanelProps) {
  return (
    <Tag className={cn('min-w-0 rounded-panel border border-line bg-surface shadow-panel', className)} {...rest}>
      {(title || action) && (
        <header className={cn('flex flex-wrap items-start justify-between gap-3', padded ? 'px-5 pt-5 sm:px-6' : 'px-5 pt-5')}>
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {action && <div className="flex max-w-full items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={cn(padded && 'p-5 sm:p-6', padded && (title || action) && 'pt-4 sm:pt-4')}>{children}</div>
    </Tag>
  )
}
