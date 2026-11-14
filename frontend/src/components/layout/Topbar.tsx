import { Menu, Search, ShoppingBasket } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState } from '../../state/AppState'
import { money } from '../../utils/format'

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { unitCount, estimatedValue } = useAppState()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/app/basket?q=${encodeURIComponent(q)}` : '/app/basket')
    setQuery('')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
      <button type="button" onClick={onOpenMenu} className="-ml-2 flex size-11 items-center justify-center rounded-lg text-ink-soft hover:bg-ink/5 lg:hidden" aria-label="Open navigation">
        <Menu className="size-5" aria-hidden />
      </button>

      <form role="search" onSubmit={onSearch} className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
        <label htmlFor="global-search" className="sr-only">
          Search products
        </label>
        <input
          id="global-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="h-11 w-full rounded-[10px] border border-transparent bg-canvas pl-9 pr-3 text-sm placeholder:text-faint focus:border-brand-600 focus:bg-surface focus:outline-none focus:ring-3 focus:ring-brand-600/15"
        />
      </form>

      <Link
        to="/app/basket"
        className="ml-auto flex min-h-11 items-center gap-2 rounded-[10px] border border-line px-3 text-sm font-medium text-ink hover:bg-canvas"
        aria-label={`Basket: ${unitCount} ${unitCount === 1 ? 'item' : 'items'}, estimated ${money(estimatedValue)}`}
      >
        <ShoppingBasket className="size-4 text-brand-700" aria-hidden />
        <span className="tnum">{unitCount}</span>
        <span className="tnum hidden text-muted sm:inline">· {money(estimatedValue)}</span>
      </Link>
    </header>
  )
}
