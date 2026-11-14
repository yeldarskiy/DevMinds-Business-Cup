import {
  Apple,
  Baby,
  Banana,
  Bandage,
  Bath,
  BriefcaseMedical,
  Coffee,
  Cookie,
  CookingPot,
  Croissant,
  Drumstick,
  Droplets,
  Egg,
  Milk,
  Nut,
  Package,
  Pill,
  PillBottle,
  Salad,
  Scroll,
  ScrollText,
  Soup,
  Sparkles,
  Sun,
  Thermometer,
  Trash2,
  WashingMachine,
  Wheat,
  type LucideIcon,
} from 'lucide-react'
import type { Category, Product } from '../../types'
import { cn } from '../../utils/cn'

const CATEGORY_STYLE: Record<Category, { bg: string; fg: string }> = {
  Groceries: { bg: '#ecfdf3', fg: '#15803d' },
  Household: { bg: '#f3f1ff', fg: '#6d28d9' },
  'Baby & Kids': { bg: '#fdf2f8', fg: '#be185d' },
  'Health & Pharmacy': { bg: '#eef4ff', fg: '#1d4ed8' },
}

const PRODUCT_ICON: Record<string, LucideIcon> = {
  milk: Milk,
  eggs: Egg,
  bread: Croissant,
  'peanut-butter': Nut,
  rice: Wheat,
  pasta: CookingPot,
  coffee: Coffee,
  bananas: Banana,
  apples: Apple,
  'chicken-breast': Drumstick,
  snacks: Cookie,
  'fresh-produce': Salad,
  'laundry-detergent': WashingMachine,
  'dish-soap': Droplets,
  'toilet-paper': Scroll,
  'paper-towels': ScrollText,
  'trash-bags': Trash2,
  'cleaning-sponges': Sparkles,
  diapers: Baby,
  'baby-wipes': Package,
  'baby-shampoo': Bath,
  'baby-formula': Milk,
  'baby-food': Soup,
  bandages: Bandage,
  thermometer: Thermometer,
  'pain-relief': Pill,
  'first-aid-kit': BriefcaseMedical,
  sunscreen: Sun,
  vitamins: PillBottle,
}

/**
 * Product artwork. The demo catalog has no licensed packshots, so each product
 * gets an illustration with its package size instead.
 */
export function ProductThumb({ product, size = 'md', className }: { product: Product; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const style = CATEGORY_STYLE[product.category]
  const Icon = PRODUCT_ICON[product.id] ?? Package
  return (
    <div
      role="img"
      aria-label={`${product.brand} ${product.name}, ${product.variant}, ${product.size}`}
      className={cn(
        'relative flex shrink-0 flex-col items-center justify-center overflow-hidden',
        size === 'sm' && 'size-11 rounded-[10px]',
        size === 'md' && 'aspect-[2/1] w-full rounded-xl',
        size === 'lg' && 'size-28 rounded-2xl',
        className,
      )}
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      <Icon className={cn(size === 'sm' ? 'size-5' : size === 'lg' ? 'size-10' : 'size-9')} strokeWidth={1.6} aria-hidden />
      {size !== 'sm' && <span className="mt-1.5 text-[11px] font-semibold opacity-80">{product.size}</span>}
    </div>
  )
}
