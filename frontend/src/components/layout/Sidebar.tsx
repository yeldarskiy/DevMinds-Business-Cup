import { RotateCcw } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppState } from '../../state/AppState'
import { cn } from '../../utils/cn'
import { Logo } from '../ui/Logo'
import { APP_NAV } from './navigation'

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { unitCount, resetDemo } = useAppState()
  const navigate = useNavigate()

  const reset = () => {
    resetDemo()
    onNavigate?.()
    navigate('/app/basket')
    toast.success('Demo reset', { description: 'Basket, plan and receipts were cleared.' })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link to="/" onClick={onNavigate} aria-label="GIMZUP home" className="rounded-lg">
          <Logo />
        </Link>
      </div>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-2">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">Your shopping journey</p>
        <ol className="space-y-0.5">
          {APP_NAV.map((item, i) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex min-h-12 items-center gap-3 rounded-[10px] px-3 py-1.5 transition-colors',
                    isActive ? 'bg-ink text-white' : 'text-ink-soft hover:bg-ink/5 hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'tnum flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                        isActive ? 'bg-brand-500 text-ink' : 'bg-canvas text-muted ring-1 ring-line group-hover:text-ink',
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className={cn('block text-xs', isActive ? 'text-white/60' : 'text-faint')}>{item.description}</span>
                    </span>
                    {item.to === '/app/basket' && unitCount > 0 && (
                      <span className={cn('tnum rounded-full px-1.5 text-xs font-semibold', isActive ? 'bg-white/15 text-white' : 'bg-brand-50 text-brand-800')}>{unitCount}</span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ol>
      </nav>
      <div className="m-3 rounded-[14px] border border-line bg-canvas p-4">
        <p className="text-xs leading-relaxed text-muted">No account needed. Your basket and receipts stay in this browser.</p>
        <button type="button" onClick={reset} className="mt-2 -ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-ink-soft hover:text-ink">
          <RotateCcw className="size-4" aria-hidden /> Reset demo
        </button>
      </div>
    </div>
  )
}
