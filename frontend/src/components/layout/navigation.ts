import { ChartLine, ReceiptText, ScanSearch, ShoppingBasket, Sparkles, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  description: string
  icon: LucideIcon
}

/** The MVP journey, in order. Each screen leads to the next. */
export const APP_NAV: NavItem[] = [
  { to: '/app/basket', label: 'Build Basket', description: 'Pick what you need', icon: ShoppingBasket },
  { to: '/app/report', label: 'Basket Intelligence', description: 'Spot false deals', icon: ScanSearch },
  { to: '/app/optimizer', label: 'Smart Optimizer', description: 'Find the best store', icon: Sparkles },
  { to: '/app/receipt', label: 'Verify Receipt', description: 'Confirm real savings', icon: ReceiptText },
  { to: '/app/dashboard', label: 'Savings Dashboard', description: 'Track your progress', icon: ChartLine },
]
