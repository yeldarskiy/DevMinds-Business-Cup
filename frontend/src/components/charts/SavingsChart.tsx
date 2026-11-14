import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthlySpend } from '../../types'
import { money } from '../../utils/format'
import { AXIS, TOOLTIP_STYLE } from './chartTheme'

export function SavingsChart({ data, height = 240 }: { data: MonthlySpend[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label={`Monthly savings: ${data.map((d) => `${d.month} ${money(d.saved)} saved, ${money(d.verified)} verified`).join('; ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="savedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e3e8f0" />
          <XAxis dataKey="month" {...AXIS} />
          <YAxis {...AXIS} tickFormatter={(v: number) => `$${v}`} width={44} />
          <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [money(Number(v ?? 0)), name === 'saved' ? 'Estimated savings' : 'Verified savings']} />
          <Area type="monotone" dataKey="saved" stroke="#059669" strokeWidth={2.5} fill="url(#savedFill)" />
          <Area type="monotone" dataKey="verified" stroke="#0f1e3d" strokeWidth={2} strokeDasharray="5 4" fill="none" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
