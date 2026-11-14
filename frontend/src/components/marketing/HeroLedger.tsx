import { motion } from 'framer-motion'
import { TriangleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { DEMO_BASKET } from '../../data/products'
import { PROMOTIONS } from '../../data/promotions'
import { storeName } from '../../data/stores'
import { analyzeDeal } from '../../utils/dealAnalyzer'
import { cn } from '../../utils/cn'
import { money } from '../../utils/format'
import { optimizeBasket } from '../../utils/optimizer'
import { StoreDot } from '../ui/StoreBadge'

/** Hero preview: a real optimizer run and promotion check over the five-staple demo basket. */
export function HeroLedger() {
  const result = useMemo(() => optimizeBasket(DEMO_BASKET), [])
  const falseDeal = useMemo(() => {
    const promo = PROMOTIONS.find((p) => p.productId === 'peanut-butter')
    return promo ? { promo, analysis: analyzeDeal(promo, 1) } : null
  }, [])
  const max = Math.max(...result.ranking.map((t) => t.total))

  return (
    <div className="relative min-w-0">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative rounded-[20px] border border-line bg-surface p-2 shadow-lift"
      >
        <div className="rounded-[14px] border border-line">
          <div className="flex items-center justify-between border-b border-dashed border-line-strong px-5 py-4">
            <div>
              <p className="text-sm font-semibold">This week’s basket</p>
              <p className="text-xs text-muted">Milk, Eggs, Bread, Peanut Butter, Bananas</p>
            </div>
            <span className="rounded-full border border-dashed border-line-strong px-2 py-0.5 text-[11px] font-medium text-muted">Sample prices</span>
          </div>
          <ol className="space-y-3 px-5 py-4">
            {result.ranking.map((t, i) => (
              <li key={t.storeId} className="flex items-center gap-3 text-sm">
                <span className="tnum w-4 text-xs font-semibold text-muted">{i + 1}</span>
                <span className="flex w-32 items-center gap-2 text-ink-soft">
                  <StoreDot id={t.storeId} />
                  {storeName(t.storeId)}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
                  <motion.span
                    className={cn('block h-full rounded-full', i === 0 ? 'bg-brand-600' : 'bg-line-strong')}
                    initial={{ width: 0 }}
                    animate={{ width: `${(t.total / max) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                  />
                </span>
                <span className={cn('tnum w-16 text-right font-semibold', i === 0 && 'text-brand-700')}>{money(t.total)}</span>
              </li>
            ))}
          </ol>
          <div className="flex items-baseline justify-between border-t border-dashed border-line-strong px-5 py-4 text-sm">
            <span className="text-muted">Best store: {storeName(result.best.storeId)}</span>
            <span>
              <span className="text-muted">You save </span>
              <span className="tnum text-2xl font-semibold tracking-tight text-brand-700">{money(result.savings)}</span>
            </span>
          </div>
        </div>
      </motion.div>
      {falseDeal && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.8 }}
          className="relative z-10 -mt-3 ml-4 hidden w-72 rounded-[14px] border border-line bg-surface p-4 shadow-lift sm:block lg:-ml-8"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-caution-600">
            <TriangleAlert className="size-4" aria-hidden /> Potential false deal
          </div>
          <p className="mt-1.5 text-sm font-medium text-ink">
            Peanut Butter at {storeName(falseDeal.promo.storeId)}: {falseDeal.promo.title}
          </p>
          <p className="mt-1 text-xs text-muted">You need 1 jar. This promotion increases spending by {money(falseDeal.analysis.extraSpend)}.</p>
        </motion.div>
      )}
    </div>
  )
}
