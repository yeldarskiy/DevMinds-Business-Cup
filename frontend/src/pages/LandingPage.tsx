import { motion } from 'framer-motion'
import { BadgeCheck, ChartLine, ReceiptText, Scale, ScanSearch, ShoppingBasket, Sparkles, TriangleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeroLedger } from '../components/marketing/HeroLedger'
import { MarketingNav } from '../components/marketing/MarketingNav'
import { Button, ButtonLink } from '../components/ui/Button'
import { Logo } from '../components/ui/Logo'
import { StoreDot } from '../components/ui/StoreBadge'
import { quotesFor } from '../data/prices'
import { getProduct } from '../data/products'
import { PROMOTIONS } from '../data/promotions'
import { STORES, storeName } from '../data/stores'
import { useAppState } from '../state/AppState'
import type { StoreId } from '../types'
import { cn } from '../utils/cn'
import { analyzeDeal } from '../utils/dealAnalyzer'
import { money } from '../utils/format'

const STEPS = [
  { icon: ShoppingBasket, title: 'Build your basket', body: 'Pick the groceries, household, baby and pharmacy items your family needs.' },
  { icon: ScanSearch, title: 'Detect false deals', body: 'See which promotions make you spend more than you planned, and why.' },
  { icon: Sparkles, title: 'Optimize the basket', body: 'Compare the whole basket across five retailers and get the best store.' },
  { icon: ReceiptText, title: 'Verify with your receipt', body: 'Upload the receipt to compare predicted and actual cost.' },
  { icon: ChartLine, title: 'Track real savings', body: 'Watch verified savings add up month over month.' },
]

const RETAILER_STRENGTH: Record<StoreId, string> = {
  walmart: 'Lowest everyday prices on groceries in this dataset.',
  amazon: 'Competitive on household and baby essentials, delivered.',
  costco: 'Strongest on bulk household and baby items. Membership required.',
  'dollar-general': 'Neighborhood basics with frequent multi-buy promotions.',
  cvs: 'Pharmacy convenience with same-day pickup, at a premium.',
}

function PriceStrip() {
  const quotes = useMemo(() => [...quotesFor('milk')].sort((a, b) => a.price - b.price), [])
  const max = Math.max(...quotes.map((q) => q.price))
  return (
    <ul className="space-y-2.5">
      {quotes.map((q, i) => (
        <li key={q.storeId} className="flex items-center gap-3 text-sm">
          <span className="flex w-32 items-center gap-2 text-ink-soft">
            <StoreDot id={q.storeId} />
            {storeName(q.storeId)}
          </span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
            <span className={cn('block h-full rounded-full', i === 0 ? 'bg-brand-600' : 'bg-line-strong')} style={{ width: `${(q.price / max) * 100}%` }} />
          </span>
          <span className={cn('tnum w-14 text-right font-medium', i === 0 && 'text-brand-700')}>{money(q.price)}</span>
        </li>
      ))}
    </ul>
  )
}

export default function LandingPage() {
  const { loadDemoBasket } = useAppState()
  const navigate = useNavigate()
  const milk = getProduct('milk')
  const pb = useMemo(() => {
    const promo = PROMOTIONS.find((p) => p.productId === 'peanut-butter')
    return promo ? { promo, a: analyzeDeal(promo, 1) } : null
  }, [])

  const viewDemo = () => {
    loadDemoBasket()
    navigate('/app/basket')
  }

  return (
    <div className="bg-surface text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <MarketingNav />

      <main id="main">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(60%_60%_at_80%_10%,rgb(16_185_129/0.10),transparent_70%)]" aria-hidden />
          <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-20">
            <motion.div className="min-w-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft">
                <span className="size-1.5 rounded-full bg-brand-600" aria-hidden />
                Family shopping intelligence
              </p>
              <h1 className="mt-6 max-w-xl text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">
                Shop Smarter.
                <br />
                Avoid Fake Deals.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">Compare prices across stores, identify misleading promotions, and verify real savings with your receipts.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink to="/app/basket" size="lg">
                  Build Basket
                </ButtonLink>
                <Button variant="secondary" size="lg" onClick={viewDemo}>
                  View Demo
                </Button>
                <a href="#retailers" className="inline-flex h-12 items-center rounded-control px-4 text-[15px] font-medium text-ink-soft hover:bg-ink/5 hover:text-ink">
                  Supported Retailers
                </a>
              </div>
              <ul className="mt-10 flex flex-wrap gap-2" aria-label="Supported retailers">
                {STORES.map((s) => (
                  <li key={s.id} className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink-soft">
                    <StoreDot id={s.id} />
                    {s.name}
                  </li>
                ))}
              </ul>
            </motion.div>
            <HeroLedger />
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-y border-line bg-canvas">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="mt-3 max-w-xl text-muted">GIMZUP follows a shopping trip from list to receipt, so the savings you see are the savings you get.</p>
            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="tnum flex size-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{i + 1}</span>
                    {i < STEPS.length - 1 && <span className="hidden h-px flex-1 bg-line-strong lg:block" aria-hidden />}
                  </div>
                  <s.icon className="mt-5 size-5 text-brand-600" aria-hidden />
                  <h3 className="mt-2 font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="scroll-mt-20">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Features</h2>
            <p className="mt-3 max-w-xl text-muted">Shopping intelligence, not coupons. Every recommendation comes with the math behind it.</p>
            <div className="mt-12 grid gap-4 lg:grid-cols-2">
              <article className="rounded-[20px] border border-line bg-surface p-6 shadow-panel lg:p-8">
                <div className="flex items-center gap-2 text-sm font-medium text-brand-700">
                  <Scale className="size-4" aria-hidden /> Compare Prices
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">Compare product prices across retailers</h3>
                {milk && (
                  <p className="mt-2 text-sm text-muted">
                    {milk.brand} {milk.variant} {milk.name}, {milk.size}, at all five retailers.
                  </p>
                )}
                <div className="mt-6">
                  <PriceStrip />
                </div>
              </article>

              <article className="rounded-[20px] bg-ink p-6 text-white lg:p-8">
                <div className="flex items-center gap-2 text-sm font-medium text-brand-400">
                  <TriangleAlert className="size-4" aria-hidden /> Detect Fake Deals
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">Identify promotions that increase spending instead of reducing it</h3>
                {pb && (
                  <>
                    <p className="mt-2 text-sm text-white/70">
                      {storeName(pb.promo.storeId)}: Peanut Butter, {pb.promo.title}. You need 1 jar.
                    </p>
                    <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-[12px] bg-white/10 text-center">
                      {[
                        ['Required', `${pb.a.requiredQuantity} jars`],
                        ['You need', `${pb.a.neededQuantity} jar`],
                        ['Extra cost', `+${money(pb.a.extraSpend)}`],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-ink-soft/60 px-3 py-4">
                          <dt className="text-xs text-white/60">{k}</dt>
                          <dd className="tnum mt-1 text-lg font-semibold">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-4 text-sm text-white/80">Recommended action: skip this promotion.</p>
                  </>
                )}
              </article>

              <article className="rounded-[16px] border border-line bg-canvas p-6 lg:p-8">
                <Sparkles className="size-5 text-brand-600" aria-hidden />
                <h3 className="mt-4 font-semibold">Optimize Your Basket</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">Prices the whole basket at every retailer, recommends the best store and explains exactly why it wins.</p>
              </article>

              <article className="rounded-[16px] border border-line bg-canvas p-6 lg:p-8">
                <BadgeCheck className="size-5 text-brand-600" aria-hidden />
                <h3 className="mt-4 font-semibold">Verify Savings</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">Upload receipts and confirm actual savings. Predicted and actual cost side by side, tracked on your dashboard.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="retailers" className="scroll-mt-20 border-y border-line bg-canvas">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Supported Retailers</h2>
            <p className="mt-3 max-w-xl text-muted">Five retailers with very different pricing strategies, compared item by item and basket by basket.</p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {STORES.map((s) => (
                <li key={s.id} className="rounded-[16px] border border-line bg-surface p-5">
                  <p className="flex items-center gap-2 font-semibold">
                    <StoreDot id={s.id} className="size-3" />
                    {s.name}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{RETAILER_STRENGTH[s.id]}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-faint">GIMZUP is independent and not affiliated with or endorsed by any retailer shown. Store names are trademarks of their owners.</p>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[24px] bg-ink px-8 py-10 text-white sm:flex-row sm:items-center sm:px-10">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Start Building Your Smart Basket Today</h2>
              <p className="mt-2 text-white/70">No account needed. Your first report takes less than a minute.</p>
            </div>
            <ButtonLink to="/app/basket" size="lg">
              Create Basket
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted">Family shopping intelligence for American households.</p>
            <p className="mt-6 max-w-sm text-xs text-faint">Prices in this preview are a sample dataset for demonstration, not live store data.</p>
          </div>
          <nav aria-label="Product">
            <p className="text-sm font-semibold">Product</p>
            <ul className="mt-3 space-y-1">
              {[
                ['#how-it-works', 'How It Works'],
                ['#features', 'Features'],
                ['#retailers', 'Retailers'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="App">
            <p className="text-sm font-semibold">App</p>
            <ul className="mt-3 space-y-1">
              {[
                ['/app/basket', 'Build Basket'],
                ['/app/optimizer', 'Smart Optimizer'],
                ['/app/dashboard', 'Savings Dashboard'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-line py-5 text-center text-xs text-faint">© {new Date().getFullYear()} GIMZUP. Made for US families.</div>
      </footer>
    </div>
  )
}
