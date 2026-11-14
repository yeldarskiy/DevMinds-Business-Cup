import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { CategorySpend } from '../../types'
import { money } from '../../utils/format'
import { CATEGORY_COLORS, TOOLTIP_STYLE } from './chartTheme'

export function CategoryDonut({ data }: { data: CategorySpend[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0)
  const sorted = [...data].sort((a, b) => b.amount - a.amount)
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[180px_1fr]">
      <div className="relative mx-auto size-[180px]" role="img" aria-label={`Spending by category: ${sorted.map((d) => `${d.category} ${money(d.amount)}`).join(', ')}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={sorted} dataKey="amount" nameKey="category" innerRadius={58} outerRadius={86} paddingAngle={1.5} stroke="none" animationDuration={600}>
              {sorted.map((d) => (
                <Cell key={d.category} fill={CATEGORY_COLORS[d.category]} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP_STYLE} formatter={(v) => money(Number(v ?? 0))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted">This month</span>
          <span className="tnum text-lg font-semibold">{money(total)}</span>
        </div>
      </div>
      <ul className="space-y-2">
        {sorted.map((d) => (
          <li key={d.category} className="flex items-center gap-2.5 text-sm">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[d.category] }} aria-hidden />
            <span className="flex-1 text-ink-soft">{d.category}</span>
            <span className="tnum font-medium">{money(d.amount)}</span>
            <span className="tnum w-10 text-right text-xs text-muted">{((d.amount / total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
