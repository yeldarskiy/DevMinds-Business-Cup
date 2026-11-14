import { BadgeCheck, Gauge, PiggyBank, ReceiptText, ShoppingBasket, Wallet } from 'lucide-react'
import { CategoryDonut } from '../components/charts/CategoryDonut'
import { SavingsChart } from '../components/charts/SavingsChart'
import { SpendingChart } from '../components/charts/SpendingChart'
import { ButtonLink } from '../components/ui/Button'
import { DemoBadge } from '../components/ui/DemoBadge'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { ProgressBar } from '../components/ui/ProgressBar'
import { PageSkeleton } from '../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../components/ui/StateViews'
import { StoreName } from '../components/ui/StoreBadge'
import { storeName } from '../data/stores'
import { useAsync } from '../hooks/useAsync'
import { dashboardService } from '../services/dashboardService'
import { useAppState } from '../state/AppState'
import { longDate, money } from '../utils/format'

export default function DashboardPage() {
  const { receipts } = useAppState()
  const summary = useAsync(() => dashboardService.getSummary(receipts), [receipts.length])

  if (summary.status === 'loading') return <PageSkeleton label="Loading your savings dashboard" />
  if (summary.status === 'error' || !summary.data) return <ErrorState message={summary.error ?? 'The dashboard could not be loaded.'} onRetry={summary.reload} />

  const s = summary.data
  const latest = receipts[0]
  const kpis = [
    { label: 'Monthly Spending', value: money(s.monthlySpending), detail: 'This month, all retailers', icon: Wallet, tone: 'text-ink' },
    { label: 'Monthly Savings', value: money(s.monthlySavings), detail: `${((s.monthlySavings / s.monthlySpending) * 100).toFixed(1)}% of spending`, icon: PiggyBank, tone: 'text-brand-700' },
    { label: 'Verified Savings', value: money(s.verifiedSavings), detail: 'Confirmed by receipts', icon: BadgeCheck, tone: 'text-brand-700' },
    { label: 'Smart Shopping Score', value: `${s.shoppingScore} / 100`, detail: 'Savings rate and verification', icon: Gauge, tone: 'text-ink' },
  ]
  const topSaved = Math.max(...s.retailers.map((r) => r.saved), 1)

  return (
    <div>
      <PageHeader
        title="Savings Dashboard"
        description="How much your household spends, saves and verifies across Walmart, Amazon, Costco, Dollar General and CVS Pharmacy."
        meta={s.source === 'demo' ? <DemoBadge label="Demo household" /> : undefined}
        actions={
          <ButtonLink to="/app/basket" icon={<ShoppingBasket className="size-4" aria-hidden />}>
            Build next basket
          </ButtonLink>
        }
      />

      {latest && (
        <div className="gz-reveal mb-6 flex flex-wrap items-center gap-3 rounded-panel border border-brand-200 bg-brand-50 px-5 py-4 text-sm text-brand-800">
          <BadgeCheck className="size-5 shrink-0" aria-hidden />
          <p className="flex-1">
            Your <StoreName id={latest.storeId} className="font-medium" /> receipt added <span className="tnum font-semibold">{money(latest.verifiedSavings)}</span> in verified savings this month.
          </p>
        </div>
      )}

      <section aria-label="Key figures" className="grid gap-px overflow-hidden rounded-panel border border-line bg-line shadow-panel sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-surface p-5 sm:p-6">
            <p className="flex items-center gap-2 text-sm text-muted">
              <k.icon className="size-4" aria-hidden /> {k.label}
            </p>
            <p className={`tnum mt-2 text-[28px] font-semibold tracking-tight ${k.tone}`}>{k.value}</p>
            <p className="mt-1 text-xs text-muted">{k.detail}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Savings trend" description="Last 6 months">
          <SavingsChart data={s.monthly} />
          <div className="mt-3 flex flex-wrap gap-5 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-brand-600" aria-hidden /> Estimated savings
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-ink" aria-hidden /> Verified savings
            </span>
          </div>
        </Panel>
        <Panel title="Spending trend" description="Last 6 months">
          <SpendingChart data={s.monthly} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Category breakdown" description="Spending this month">
          <CategoryDonut data={s.categories} />
        </Panel>

        <Panel title="Top performing retailers" description="Ranked by savings this month">
          <ol className="space-y-4">
            {s.retailers.map((r, i) => (
              <li key={r.storeId}>
                <div className="flex items-center gap-3 text-sm">
                  <span className="tnum w-5 font-semibold text-muted">{i + 1}</span>
                  <StoreName id={r.storeId} className="flex-1 font-medium" />
                  <span className="tnum font-semibold text-brand-700">{money(r.saved)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 pl-8">
                  <ProgressBar value={r.saved} max={topSaved} label={`Savings at ${storeName(r.storeId)}`} className="h-1.5 flex-1" />
                  <span className="tnum w-36 text-right text-xs text-muted">
                    {money(r.spent)} spent · {r.trips} {r.trips === 1 ? 'trip' : 'trips'}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel title="Verified receipts" description="Receipts you verified in this browser" className="mt-6" padded={false}>
        {receipts.length === 0 ? (
          <EmptyState
            icon={<ReceiptText className="size-5" aria-hidden />}
            title="No savings verified yet"
            description="Upload a receipt after shopping to confirm what you actually saved."
            action={
              <ButtonLink to="/app/receipt" variant="secondary">
                Verify a receipt
              </ButtonLink>
            }
          />
        ) : (
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {receipts.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 sm:px-6">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-canvas ring-1 ring-line">
                  <ReceiptText className="size-4 text-ink-soft" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <StoreName id={r.storeId} className="text-sm font-medium" />
                  <span className="block text-xs text-muted">
                    {longDate(r.purchasedAt)} · {r.items.reduce((n, i) => n + i.quantity, 0)} items · predicted {money(r.predictedTotal)}
                  </span>
                </span>
                <span className="text-right">
                  <span className="tnum block text-sm font-semibold">{money(r.total)}</span>
                  <span className="tnum block text-xs text-brand-700">verified {money(r.verifiedSavings)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
