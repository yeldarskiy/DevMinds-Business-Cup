import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { averagePrice } from '../../data/prices'
import { STORES } from '../../data/stores'
import { useAppState } from '../../state/AppState'
import type { ProductWithPrices } from '../../types'
import { cn } from '../../utils/cn'
import { money } from '../../utils/format'
import { Button } from '../ui/Button'
import { DemoBadge } from '../ui/DemoBadge'
import { Modal } from '../ui/Modal'
import { StoreName } from '../ui/StoreBadge'
import { AvailabilityTag } from './AvailabilityTag'
import { ProductThumb } from './ProductThumb'

export function ProductDetailModal({ product, onClose }: { product: ProductWithPrices; onClose: () => void }) {
  const { addToBasket, basket } = useAppState()
  const quotes = [...product.quotes].filter((q) => q.availability !== 'out_of_stock').sort((a, b) => a.price - b.price)
  const cheapest = quotes[0]
  const priciest = quotes[quotes.length - 1]
  const average = averagePrice(product.id)
  const inBasket = basket.find((i) => i.productId === product.id)

  const add = () => {
    addToBasket(product.id)
    toast.success('Added to basket', { description: `${product.name}, ${product.brand}` })
  }

  return (
    <Modal
      onClose={onClose}
      title={`${product.name} · ${product.brand}`}
      description={`${product.variant}, ${product.size}`}
      size="lg"
      footer={
        <Button onClick={add} icon={<Plus className="size-4" aria-hidden />}>
          {inBasket ? `Add another (${inBasket.quantity} in basket)` : 'Add to basket'}
        </Button>
      }
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <ProductThumb product={product} size="lg" />
        <div className="flex-1">
          {cheapest && priciest ? (
            <>
              <p className="text-sm text-muted">Lowest price</p>
              <p className="tnum text-3xl font-semibold tracking-tight">
                {money(cheapest.price)} <span className="text-base font-medium text-muted">at <StoreName id={cheapest.storeId} /></span>
              </p>
              <p className="mt-1 text-sm text-muted">
                Average {money(average)} across {quotes.length} retailers. The gap between the cheapest and the most expensive is {money(priciest.price - cheapest.price)}.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">No retailer has this product available right now.</p>
          )}
        </div>
        <DemoBadge className="self-start" />
      </div>

      <div className="mt-6 overflow-x-auto rounded-[12px] border border-line">
        <table className="w-full min-w-[440px] text-sm">
          <caption className="sr-only">Price of {product.name} by retailer</caption>
          <thead className="bg-canvas text-left text-xs text-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">Retailer</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Price</th>
              <th scope="col" className="px-4 py-2.5 font-medium">vs average</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Availability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {quotes.map((q) => {
              const diff = average > 0 ? ((q.price - average) / average) * 100 : 0
              return (
                <tr key={q.storeId} className={cn(q === cheapest && 'bg-brand-50/60')}>
                  <td className="px-4 py-3">
                    <StoreName id={q.storeId} className="font-medium" />
                    {q === cheapest && <span className="ml-2 text-xs font-medium text-brand-700">Lowest</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="tnum font-semibold">{money(q.price)}</span>
                    {q.previousPrice && <span className="tnum ml-2 text-xs text-faint line-through">{money(q.previousPrice)}</span>}
                  </td>
                  <td className={cn('tnum px-4 py-3 text-sm', diff <= 0 ? 'text-brand-700' : 'text-danger-600')}>
                    {diff > 0 ? '+' : ''}
                    {diff.toFixed(0)}%
                  </td>
                  <td className="px-4 py-3">
                    <AvailabilityTag availability={q.availability} checkedAt={q.checkedAt} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {product.quotes.length < STORES.length && (
        <p className="mt-3 text-xs text-muted">
          Not carried by {STORES.filter((s) => !product.quotes.some((q) => q.storeId === s.id)).map((s) => s.name).join(' or ')} in this comparison.
        </p>
      )}
    </Modal>
  )
}
