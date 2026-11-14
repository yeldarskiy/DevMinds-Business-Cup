import { getStore } from '../../data/stores'
import type { StoreId } from '../../types'
import { cn } from '../../utils/cn'

export function StoreDot({ id, className }: { id: StoreId; className?: string }) {
  return <span className={cn('inline-block size-2.5 shrink-0 rounded-full', className)} style={{ backgroundColor: getStore(id).color }} aria-hidden />
}

export function StoreName({ id, className }: { id: StoreId; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <StoreDot id={id} />
      {getStore(id).name}
    </span>
  )
}
