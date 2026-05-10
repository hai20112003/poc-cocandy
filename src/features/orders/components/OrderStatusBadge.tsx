import { cn } from '@/utils/cn'
import type { OrderStatus } from '../types'

const STATUS_STYLE: Record<OrderStatus, string> = {
  'Đã về khớp':   'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  'Đang giao':    'bg-blue-50    text-blue-700    dark:bg-blue-950/40    dark:text-blue-400',
  'Đã đặt':       'bg-amber-50   text-amber-700   dark:bg-amber-950/40   dark:text-amber-400',
  'Về lệch bill': 'bg-red-50     text-red-700     dark:bg-red-950/40     dark:text-red-400',
  'Về một phần':  'bg-violet-50  text-violet-700  dark:bg-violet-950/40  dark:text-violet-400',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap', STATUS_STYLE[status])}>
      {status}
    </span>
  )
}
