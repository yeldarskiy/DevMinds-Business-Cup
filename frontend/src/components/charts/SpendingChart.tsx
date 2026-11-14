import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthlySpend } from '../../types'
import { money } from '../../utils/format'
import { AXIS, TOOLTIP_STYLE } from './chartTheme'

export function SpendingChart({ data, height = 240 }: { data: MonthlySpend[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label={`Monthly spending: ${data.map((d) => `${d.month} ${money(d.spent)}`).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e3e8f0" />
          <XAxis dataKey="month" {...AXIS} />
          <YAxis {...AXIS} tickFormatter={(v: number) => `$${v}`} width={52} />
          <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [money(Number(v ?? 0)), 'Spent']} />
          <Bar dataKey="spent" fill="#0f1e3d" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
