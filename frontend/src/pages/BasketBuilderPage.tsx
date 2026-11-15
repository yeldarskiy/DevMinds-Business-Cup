import { ArrowRight, PackageSearch, Plus, ShoppingBasket, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ProductDetailModal } from '../components/products/ProductDetailModal'
import { ProductThumb } from '../components/products/ProductThumb'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ChoiceChip } from '../components/ui/ChoiceChip'
import { DemoBadge } from '../components/ui/DemoBadge'
import { inputClasses } from '../components/ui/Field'
import { PageHeader } from '../components/ui/PageHeader'
import { QuantityStepper } from '../components/ui/QuantityStepper'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../components/ui/StateViews'
import { StoreName } from '../components/ui/StoreBadge'
import { CATEGORIES } from '../data/products'
import { useAsync } from '../hooks/useAsync'
import { productService } from '../services/productService'
import { useAppState } from '../state/AppState'
import type { Category, ProductWithPrices } from '../types'
import { cn } from '../utils/cn'
import { money } from '../utils/format'

function lowest(product: ProductWithPrices) {
  return [...product.quotes].filter((q) => q.availability !== 'out_of_stock').sort((a, b) => a.price - b.price)[0]
}

function BasketSummary({ onAnalyze }: { onAnalyze: () => void }) {
  const { basketLines, unitCount, estimatedValue, setQuantity, removeFromBasket, clearBasket, loadDemoBasket } = useAppState()

  return (
    <section aria-labelledby="basket-title" className="flex min-w-0 flex-col rounded-panel border border-line bg-surface shadow-panel">
      <header className="flex items-center justify-between gap-3 px-5 pt-5">
        <h2 id="basket-title" className="text-[15px] font-semibold tracking-tight">
          Your basket
        </h2>
        {basketLines.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearBasket()
              toast('Basket cleared')
            }}
          >
            Clear
          </Button>
        )}
      </header>

      {basketLines.length === 0 ? (
        <EmptyState
          className="py-10"
          icon={<ShoppingBasket className="size-5" aria-hidden />}
          title="Your basket is empty"
          description="Add the products your family needs this week, or start from a sample basket of five staples."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                loadDemoBasket()
                toast.success('Demo basket loaded', { description: 'Milk, Eggs, Bread, Peanut Butter and Bananas' })
              }}
            >
              Load demo basket
            </Button>
          }
        />
      ) : (
        <ul className="mt-3 max-h-[52vh] divide-y divide-line overflow-y-auto border-t border-line">
          {basketLines.map((line) => (
            <li key={line.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <ProductThumb product={line.product} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{line.name}</p>
                <p className="truncate text-xs text-muted">
                  {line.product.brand} · avg {money(line.price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  removeFromBasket(line.id)
                  toast(`Removed ${line.name}`)
                }}
                className="flex size-11 items-center justify-center rounded-lg text-faint hover:bg-danger-50 hover:text-danger-600"
                aria-label={`Remove ${line.name}`}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
              <div className="flex w-full items-center justify-between pl-14">
                <QuantityStepper value={line.quantity} onChange={(v) => setQuantity(line.id, v)} label={line.name} />
                <span className="tnum text-sm font-semibold">{money(line.price * line.quantity)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-auto border-t border-line bg-canvas/60 px-5 py-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted">
            {basketLines.length} {basketLines.length === 1 ? 'product' : 'products'}
            {unitCount !== basketLines.length && `, ${unitCount} units`}
          </span>
          <span className="text-right">
            <span className="block text-xs text-muted">Estimated basket value</span>
            <span className="tnum text-lg font-semibold">{money(estimatedValue)}</span>
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">At the average price across all five retailers.</p>
        <Button size="lg" className="mt-4 w-full" onClick={onAnalyze} disabled={basketLines.length === 0} icon={<ArrowRight className="size-4" aria-hidden />}>
          Analyze Basket
        </Button>
      </footer>
    </section>
  )
}

export default function BasketBuilderPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { basket, basketLines, estimatedValue, addToBasket, setQuantity } = useAppState()
  const products = useAsync(() => productService.getProducts())
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState<Category | null>(null)
  const [selected, setSelected] = useState<ProductWithPrices | null>(null)

  useEffect(() => {
    setQuery(params.get('q') ?? '')
  }, [params])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return (products.data ?? []).filter(
      (p) => (!category || p.category === category) && (!needle || `${p.name} ${p.brand} ${p.variant} ${p.category}`.toLowerCase().includes(needle)),
    )
  }, [products.data, query, category])

  const counts = useMemo(() => {
    const map = new Map<Category, number>()
    for (const p of products.data ?? []) map.set(p.category, (map.get(p.category) ?? 0) + 1)
    return map
  }, [products.data])

  const clearFilters = () => {
    setQuery('')
    setCategory(null)
    setParams({})
  }

  const analyze = () => navigate('/app/report')

  return (
    <div className="pb-24 lg:pb-0">
      <PageHeader title="Build Basket" description="Add what your family needs. GIMZUP compares every item across five retailers." meta={products.source === 'demo' || products.data?.every((p) => p.quotes.every((q) => q.source === 'demo')) ? <DemoBadge label="Sample retailer prices" /> : undefined} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="relative">
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <PackageSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })
              }}
              placeholder="Search products..."
              className={cn(inputClasses, 'pl-9')}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <ChoiceChip selected={category === null} onToggle={() => setCategory(null)}>
              All
            </ChoiceChip>
            {CATEGORIES.map((c) => (
              <ChoiceChip key={c} selected={category === c} onToggle={() => setCategory(category === c ? null : c)}>
                {c}
                {counts.get(c) !== undefined && <span className="tnum text-xs text-faint">{counts.get(c)}</span>}
              </ChoiceChip>
            ))}
          </div>

          <section className="mt-5" aria-live="polite" aria-busy={products.status === 'loading'}>
            {products.status === 'loading' && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading products">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-72" />
                ))}
              </div>
            )}
            {products.status === 'error' && <ErrorState message={products.error ?? ''} onRetry={products.reload} />}
            {products.status === 'success' && (
              <>
                <p className="mb-3 text-sm text-muted">
                  {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
                  {category && ` in ${category}`}
                </p>
                {filtered.length === 0 ? (
                  <div className="rounded-panel border border-line bg-surface">
                    <EmptyState
                      icon={<PackageSearch className="size-5" aria-hidden />}
                      title="No products found"
                      description="Try a different search term or another category."
                      action={
                        <Button variant="secondary" onClick={clearFilters} icon={<X className="size-4" aria-hidden />}>
                          Clear search and filters
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((product) => {
                      const best = lowest(product)
                      const inBasket = basket.find((i) => i.productId === product.id)
                      return (
                        <li key={product.id}>
                          <article className="flex h-full flex-col rounded-panel border border-line bg-surface p-3 shadow-panel transition-shadow hover:shadow-lift">
                            <ProductThumb product={product} />
                            <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold leading-snug text-ink">{product.name}</h3>
                                <Badge>{product.category}</Badge>
                              </div>
                              <p className="text-sm text-ink-soft">{product.brand}</p>
                              <p className="text-xs text-muted">{product.variant}</p>
                              {best ? (
                                <p className="mt-3 flex flex-wrap items-baseline gap-x-1.5 text-sm text-muted">
                                  from <span className="tnum text-lg font-semibold text-ink">{money(best.price)}</span> at <StoreName id={best.storeId} className="text-ink-soft" />
                                </p>
                              ) : (
                                <p className="mt-3 text-sm text-danger-600">Unavailable at every retailer</p>
                              )}
                              <div className="mt-auto flex items-center gap-2 pt-4">
                                <Button variant="ghost" size="sm" className="-ml-2" onClick={() => setSelected(product)}>
                                  Compare {product.quotes.length} prices
                                </Button>
                                <div className="ml-auto">
                                  {inBasket ? (
                                    <QuantityStepper value={inBasket.quantity} onChange={(v) => setQuantity(product.id, v)} label={product.name} />
                                  ) : (
                                    <Button
                                      size="sm"
                                      className="h-11"
                                      disabled={!best}
                                      onClick={() => {
                                        addToBasket(product.id)
                                        toast.success('Added to basket', { description: `${product.name}, ${product.brand}` })
                                      }}
                                      aria-label={`Add ${product.name} to basket`}
                                      icon={<Plus className="size-4" aria-hidden />}
                                    >
                                      Add
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </article>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </>
            )}
          </section>
        </div>

        <aside className="hidden lg:block" aria-label="Basket summary">
          <div className="sticky top-24">
            <BasketSummary onAnalyze={analyze} />
          </div>
        </aside>
      </div>

      <div className="lg:hidden">
        <div className="mt-6">
          <BasketSummary onAnalyze={analyze} />
        </div>
        {basketLines.length > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">
                {basketLines.length} {basketLines.length === 1 ? 'product' : 'products'}
              </p>
              <p className="tnum font-semibold">{money(estimatedValue)}</p>
            </div>
            <Button onClick={analyze} icon={<ArrowRight className="size-4" aria-hidden />}>
              Analyze Basket
            </Button>
          </div>
        )}
      </div>

      {selected && <ProductDetailModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
