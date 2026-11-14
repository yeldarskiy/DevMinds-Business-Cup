import { motion } from 'framer-motion'
import { ArrowRight, CircleCheck, Lightbulb, ScanSearch, ShoppingBasket, TrendingDown, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { ProductThumb } from '../components/products/ProductThumb'
import { Badge } from '../components/ui/Badge'
import { Button, ButtonLink } from '../components/ui/Button'
import { DemoBadge } from '../components/ui/DemoBadge'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../components/ui/StateViews'
import { getProduct } from '../data/products'
import { useAsync } from '../hooks/useAsync'
import { basketService } from '../services/basketService'
import { useAppState } from '../state/AppState'
import type { BasketInsight, BasketItem } from '../types'
import { cn } from '../utils/cn'
import { money, round2 } from '../utils/format'

function InsightCard({ insight, index }: { insight: BasketInsight; index: number }) {
  const { setQuantity, basket } = useAppState()
  const product = getProduct(insight.productId)
  const warning = insight.severity === 'warning'
  const current = basket.find((i) => i.productId === insight.productId)?.quantity
  const fixApplied = insight.fix !== null && current === insight.fix.quantity

  return (
    <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.05 }}>
      <article className={cn('rounded-panel border bg-surface p-5 shadow-panel sm:p-6', warning ? 'border-caution-600/30' : 'border-brand-200')}>
        <div className="flex flex-wrap items-start gap-4">
          {product && <ProductThumb product={product} size="sm" />}
          <div className="min-w-0 flex-1">
            <p className={cn('flex items-center gap-1.5 text-sm font-semibold', warning ? 'text-caution-600' : 'text-brand-700')}>
              {warning ? <TriangleAlert className="size-4" aria-hidden /> : <Lightbulb className="size-4" aria-hidden />}
              {insight.title}
            </p>
            <h3 className="mt-1 font-semibold text-ink">{insight.summary}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">{insight.costImpact >= 0 ? 'Additional cost' : 'Potential saving'}</p>
            <p className={cn('tnum text-xl font-semibold tracking-tight', insight.costImpact >= 0 ? 'text-danger-600' : 'text-brand-700')}>
              {insight.costImpact >= 0 ? '+' : '−'}
              {money(Math.abs(insight.costImpact))}
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
          {insight.details.map((d) => (
            <li key={d} className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-faint" aria-hidden />
              {d}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-canvas px-4 py-3">
          <p className="text-sm">
            <span className="font-semibold text-ink">Recommended action: </span>
            <span className="text-ink-soft">{insight.recommendation}</span>
          </p>
          {insight.fix && (
            <Button
              size="sm"
              variant="secondary"
              disabled={fixApplied}
              onClick={() => {
                if (!insight.fix) return
                setQuantity(insight.productId, insight.fix.quantity)
                toast.success('Basket updated', { description: `${product?.name ?? 'Item'} quantity set to ${insight.fix.quantity}.` })
              }}
            >
              {fixApplied ? 'Applied' : insight.fix.label}
            </Button>
          )}
        </div>
      </article>
    </motion.li>
  )
}

function ReportContent({ basket }: { basket: BasketItem[] }) {
  const signature = JSON.stringify(basket)
  const report = useAsync(() => basketService.analyze(basket), [signature])

  if (report.status === 'loading') {
    return (
      <div role="status" aria-label="Analyzing basket" className="space-y-4">
        <p className="flex items-center gap-2 text-sm text-muted">
          <ScanSearch className="size-4 animate-pulse" aria-hidden /> Checking promotions, sale tags and quantities…
        </p>
        <Skeleton className="h-32" />
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
      </div>
    )
  }
  if (report.status === 'error' || !report.data) return <ErrorState message={report.error ?? 'The analysis could not be completed.'} onRetry={report.reload} />

  const r = report.data
  const avoidable = round2(r.issues.reduce((s, i) => s + Math.max(0, i.costImpact), 0))
  const stats = [
    { label: 'Products', value: String(r.productCount) },
    { label: 'Potential issues', value: String(r.issues.length), tone: r.issues.length > 0 ? 'text-caution-600' : 'text-ink' },
    { label: 'Opportunities', value: String(r.opportunities.length), tone: 'text-brand-700' },
    { label: 'Estimated basket value', value: money(r.estimatedValue) },
  ]

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-8">
        <section aria-labelledby="overview-title" className="overflow-hidden rounded-panel border border-line bg-surface shadow-panel">
          <div className="flex flex-wrap items-center gap-3 px-5 pt-5 sm:px-6">
            <CircleCheck className="size-5 text-brand-600" aria-hidden />
            <h2 id="overview-title" className="text-lg font-semibold tracking-tight">
              Basket Analysis Complete
            </h2>
            {r.source === 'demo' && <DemoBadge />}
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface px-5 py-4 sm:px-6">
                <dt className="text-xs text-muted">{s.label}</dt>
                <dd className={cn('tnum mt-1 text-2xl font-semibold tracking-tight', s.tone)}>{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="warnings-title">
          <h2 id="warnings-title" className="flex items-center gap-2 text-[15px] font-semibold">
            Warnings
            <Badge tone={r.issues.length > 0 ? 'caution' : 'brand'}>{r.issues.length}</Badge>
          </h2>
          {r.issues.length === 0 ? (
            <div className="mt-3 flex items-start gap-3 rounded-panel border border-brand-200 bg-brand-50 p-5 text-sm text-brand-800">
              <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
              No misleading promotions, inflated sale tags or risky quantities in this basket.
            </div>
          ) : (
            <ul className="mt-3 space-y-4">
              {r.issues.map((i, idx) => (
                <InsightCard key={i.id} insight={i} index={idx} />
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="opportunities-title">
          <h2 id="opportunities-title" className="flex items-center gap-2 text-[15px] font-semibold">
            Opportunities
            <Badge tone="brand">{r.opportunities.length}</Badge>
          </h2>
          {r.opportunities.length === 0 ? (
            <p className="mt-3 rounded-panel border border-line bg-surface p-5 text-sm text-muted">No genuine deals or price gaps worth acting on for these products.</p>
          ) : (
            <ul className="mt-3 space-y-4">
              {r.opportunities.map((i, idx) => (
                <InsightCard key={i.id} insight={i} index={idx} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <Panel title="Recommendations" description="What to do before you shop">
          <div className="rounded-[12px] bg-canvas p-4">
            <p className="text-xs text-muted">Avoidable extra spending</p>
            <p className={cn('tnum mt-1 text-2xl font-semibold tracking-tight', avoidable > 0 ? 'text-danger-600' : 'text-brand-700')}>{money(avoidable)}</p>
          </div>
          <ol className="mt-4 space-y-3 text-sm">
            {[...r.issues, ...r.opportunities.filter((o) => o.kind !== 'price_spread')].map((i) => (
              <li key={i.id} className="flex gap-2.5">
                {i.severity === 'warning' ? (
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-caution-600" aria-hidden />
                ) : (
                  <TrendingDown className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                )}
                <span className="text-ink-soft">
                  <span className="font-medium text-ink">{getProduct(i.productId)?.name}: </span>
                  {i.recommendation}
                </span>
              </li>
            ))}
            <li className="flex gap-2.5">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden />
              <span className="text-ink-soft">Compare the whole basket across all five retailers to find the cheapest store.</span>
            </li>
          </ol>
          <ButtonLink to="/app/optimizer" size="lg" className="mt-6 w-full" icon={<ArrowRight className="size-4" aria-hidden />}>
            Optimize Basket
          </ButtonLink>
          <ButtonLink to="/app/basket" variant="ghost" className="mt-2 w-full">
            Edit basket
          </ButtonLink>
        </Panel>
      </aside>
    </div>
  )
}

export default function BasketReportPage() {
  const { basket } = useAppState()

  return (
    <div>
      <PageHeader title="Basket Intelligence Report" description="GIMZUP checks every item for promotions that cost more than they save, inflated sale tags and quantities you may not need." />
      {basket.length === 0 ? (
        <div className="rounded-panel border border-line bg-surface">
          <EmptyState
            icon={<ShoppingBasket className="size-5" aria-hidden />}
            title="Nothing to analyze yet"
            description="Add products to your basket and GIMZUP will check them for misleading promotions."
            action={<ButtonLink to="/app/basket">Build basket</ButtonLink>}
          />
        </div>
      ) : (
        <ReportContent basket={basket} />
      )}
    </div>
  )
}
