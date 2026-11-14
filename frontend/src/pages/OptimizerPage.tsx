import { motion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, Clock, ReceiptText, ShoppingBasket, Sparkles, Split, Trophy } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '../components/ui/Badge'
import { Button, ButtonLink } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../components/ui/StateViews'
import { StoreDot, StoreName } from '../components/ui/StoreBadge'
import { storeName, STORES } from '../data/stores'
import { useAsync } from '../hooks/useAsync'
import { basketService } from '../services/basketService'
import { useAppState } from '../state/AppState'
import type { BasketItem, ShoppingPlan, StoreTotal } from '../types'
import { cn } from '../utils/cn'
import { money, round2 } from '../utils/format'

function planFor(t: StoreTotal): ShoppingPlan {
  return {
    storeId: t.storeId,
    predictedTotal: t.total,
    baseline: round2(t.lines.reduce((s, l) => s + l.averageUnitPrice * l.quantity, 0)),
    items: t.lines.map((l) => ({ productId: l.productId, name: l.name, quantity: l.quantity, unitPrice: l.unitPrice })),
    createdAt: new Date().toISOString(),
  }
}

function Breakdown({ total }: { total: StoreTotal }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <caption className="sr-only">Price breakdown at {storeName(total.storeId)}</caption>
        <thead className="text-left text-xs text-muted">
          <tr>
            <th scope="col" className="py-2 font-medium">Product</th>
            <th scope="col" className="py-2 text-right font-medium">Qty</th>
            <th scope="col" className="py-2 text-right font-medium">Unit price</th>
            <th scope="col" className="py-2 text-right font-medium">vs average</th>
            <th scope="col" className="py-2 text-right font-medium">Line total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {total.lines.map((l) => {
            const diff = ((l.unitPrice - l.averageUnitPrice) / l.averageUnitPrice) * 100
            return (
              <tr key={l.productId}>
                <td className="py-2">{l.name}</td>
                <td className="tnum py-2 text-right">{l.quantity}</td>
                <td className="tnum py-2 text-right">{money(l.unitPrice)}</td>
                <td className={cn('tnum py-2 text-right', diff <= 0 ? 'text-brand-700' : 'text-danger-600')}>
                  {diff > 0 ? '+' : ''}
                  {diff.toFixed(0)}%
                </td>
                <td className="tnum py-2 text-right font-medium">{money(l.lineTotal)}</td>
              </tr>
            )
          })}
          {total.missing.map((name) => (
            <tr key={name} className="text-faint">
              <td className="py-2">{name}</td>
              <td colSpan={4} className="py-2 text-right text-xs">
                Not carried
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OptimizerContent({ basket }: { basket: BasketItem[] }) {
  const signature = JSON.stringify(basket)
  const result = useAsync(() => basketService.optimize(basket), [signature])
  const { savePlan } = useAppState()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string | null>(null)
  const announced = useRef<string | null>(null)

  useEffect(() => {
    if (result.status !== 'success' || !result.data || announced.current === signature) return
    announced.current = signature
    setExpanded(result.data.best.storeId)
    toast.success('Optimizer finished', { description: `${storeName(result.data.best.storeId)} is the best option at ${money(result.data.best.total)}.` })
  }, [result.status, result.data, signature])

  if (result.status === 'loading') {
    return (
      <div role="status" aria-label="Comparing retailers" className="space-y-4">
        <p className="flex items-center gap-2 text-sm text-muted">
          <Sparkles className="size-4 animate-pulse" aria-hidden /> Comparing your basket across {STORES.length} retailers…
        </p>
        <Skeleton className="h-56" />
        <Skeleton className="h-72" />
      </div>
    )
  }
  if (result.status === 'error' || !result.data) return <ErrorState message={result.error ?? 'The optimizer could not finish.'} onRetry={result.reload} />

  const r = result.data
  const best = r.best
  const verify = (t: StoreTotal) => {
    savePlan(planFor(t))
    toast.success('Plan saved', { description: `Shopping at ${storeName(t.storeId)}. Upload the receipt after your trip.` })
    navigate('/app/receipt')
  }
  const alternatives = r.ranking.filter((t) => t !== best && t.missing.length === 0).slice(0, 2)

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        aria-labelledby="best-option"
        className="overflow-hidden rounded-panel border border-ink/10 bg-surface shadow-lift"
      >
        <div className="bg-ink p-6 text-white sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand" icon={<Trophy className="size-3" aria-hidden />}>
              Basket Optimized
            </Badge>
            {r.source === 'demo' && <span className="text-xs text-white/60">Calculated from sample prices</span>}
          </div>
          <dl className="mt-5 grid gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-white/60">Best store</dt>
              <dd id="best-option" className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
                <StoreDot id={best.storeId} className="size-3" /> {storeName(best.storeId)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-white/60">Total cost</dt>
              <dd className="tnum mt-1 text-2xl font-semibold tracking-tight">{money(best.total)}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/60">Estimated savings</dt>
              <dd className="tnum mt-1 text-2xl font-semibold tracking-tight text-brand-400">
                {money(r.savings)} <span className="text-sm font-medium text-white/60">({r.savingsPercent.toFixed(1)}%)</span>
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-white/60">Savings compare this store with buying the same items at the average price across all five retailers ({money(round2(best.total + r.savings))}).</p>
        </div>
        <div className="p-6 sm:p-7">
          <h2 className="text-[15px] font-semibold">Why {storeName(best.storeId)}?</h2>
          <ul className="mt-3 space-y-2">
            {r.reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                {reason}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button size="lg" onClick={() => verify(best)} icon={<ReceiptText className="size-4" aria-hidden />}>
              Verify With Receipt
            </Button>
            <ButtonLink to="/app/report" variant="secondary" size="lg">
              Back to report
            </ButtonLink>
          </div>
        </div>
      </motion.section>

      <Panel title="Store comparison" description="The whole basket priced at each retailer. Select a row for the price breakdown." padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">Store ranking for your basket</caption>
            <thead className="border-y border-line bg-canvas text-left text-xs text-muted">
              <tr>
                <th scope="col" className="px-5 py-2.5 font-medium sm:px-6">Rank</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Store</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Total cost</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Difference</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Availability</th>
                <th scope="col" className="px-5 py-2.5 sm:px-6">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {r.ranking.map((t, i) => {
                const open = expanded === t.storeId
                const diff = round2(t.total - best.total)
                return (
                  <Fragment key={t.storeId}>
                    <tr className={cn('border-b border-line', t === best && 'bg-brand-50/50')}>
                      <td className="tnum px-5 py-3 font-semibold sm:px-6">{i + 1}</td>
                      <td className="px-3 py-3">
                        <StoreName id={t.storeId} className="font-medium" />
                        {t === best && <span className="ml-2 text-xs font-medium text-brand-700">Best</span>}
                      </td>
                      <td className="tnum px-3 py-3 text-right font-semibold">{money(t.total)}</td>
                      <td className={cn('tnum px-3 py-3 text-right', diff > 0 ? 'text-danger-600' : 'text-muted')}>{t === best ? '—' : `+${money(diff)}`}</td>
                      <td className="px-3 py-3 text-xs">
                        {t.missing.length === 0 ? <span className="text-brand-700">All {t.lines.length} items</span> : <span className="text-caution-600">Missing {t.missing.join(', ')}</span>}
                      </td>
                      <td className="px-5 py-3 text-right sm:px-6">
                        <button
                          type="button"
                          onClick={() => setExpanded(open ? null : t.storeId)}
                          aria-expanded={open}
                          aria-controls={`breakdown-${t.storeId}`}
                          className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
                        >
                          Breakdown <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden />
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr id={`breakdown-${t.storeId}`} className="border-b border-line bg-canvas/40">
                        <td colSpan={6} className="px-5 pb-4 pt-1 sm:px-6">
                          <Breakdown total={t} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {(alternatives.length > 0 || r.split || r.convenience) && (
      <section aria-labelledby="alternatives-title">
        <h2 id="alternatives-title" className="text-[15px] font-semibold">
          Alternative options
        </h2>
        <ul className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {alternatives.map((t) => (
            <li key={t.storeId} className="flex flex-col rounded-panel border border-line bg-surface p-5 shadow-panel">
              <StoreName id={t.storeId} className="font-semibold" />
              <p className="tnum mt-2 text-2xl font-semibold tracking-tight">{money(t.total)}</p>
              <p className="text-sm text-muted">{money(round2(t.total - best.total))} more than the best option</p>
              <Button variant="secondary" size="sm" className="mt-4 self-start" onClick={() => verify(t)}>
                Shop here instead
              </Button>
            </li>
          ))}
          {r.split && (
            <li className="flex flex-col rounded-panel border border-brand-200 bg-surface p-5 shadow-panel">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                <Split className="size-4" aria-hidden /> Split between two stores
              </p>
              <p className="tnum mt-2 text-2xl font-semibold tracking-tight">{money(r.split.total)}</p>
              <p className="text-sm text-muted">
                {r.split.stores.map(storeName).join(' + ')}, including {money(r.split.tripCost)} for the extra trip. Saves {money(r.split.savingsVsBest)} more.
              </p>
              <ul className="mt-3 space-y-1 text-xs text-ink-soft">
                {r.split.assignments.map((a) => (
                  <li key={a.productId} className="flex items-center gap-1.5">
                    <StoreDot id={a.storeId} /> {a.name}
                  </li>
                ))}
              </ul>
            </li>
          )}
          {r.convenience && (
            <li className="flex flex-col rounded-panel border border-line bg-surface p-5 shadow-panel">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Clock className="size-4" aria-hidden /> Closest option
              </p>
              <StoreName id={r.convenience.storeId} className="mt-2 font-semibold" />
              <p className="tnum mt-1 text-2xl font-semibold tracking-tight">{money(r.convenience.total)}</p>
              <p className="text-sm text-muted">
                {r.convenience.reason} Costs {money(r.convenience.extraCost)} more than {storeName(best.storeId)}.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4 self-start"
                onClick={() => {
                  const cvs = r.ranking.find((t) => t.storeId === r.convenience?.storeId)
                  if (cvs) verify(cvs)
                }}
              >
                Shop here instead
              </Button>
            </li>
          )}
        </ul>
      </section>
      )}

      <div className="flex flex-col items-start justify-between gap-4 rounded-panel border border-line bg-surface p-5 shadow-panel sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="font-semibold">Done shopping at {storeName(best.storeId)}?</p>
          <p className="text-sm text-muted">Upload the receipt to turn estimated savings into verified savings.</p>
        </div>
        <Button onClick={() => verify(best)} icon={<ArrowRight className="size-4" aria-hidden />}>
          Verify With Receipt
        </Button>
      </div>
    </div>
  )
}

export default function OptimizerPage() {
  const { basket } = useAppState()
  return (
    <div>
      <PageHeader title="Smart Basket Optimizer" description="Your whole basket priced at Walmart, Amazon, Costco, Dollar General and CVS Pharmacy, with the reasoning behind the recommendation." />
      {basket.length === 0 ? (
        <div className="rounded-panel border border-line bg-surface">
          <EmptyState
            icon={<ShoppingBasket className="size-5" aria-hidden />}
            title="No basket to optimize"
            description="Add products first. The optimizer compares the full basket across all five retailers."
            action={<ButtonLink to="/app/basket">Build basket</ButtonLink>}
          />
        </div>
      ) : (
        <OptimizerContent basket={basket} />
      )}
    </div>
  )
}
