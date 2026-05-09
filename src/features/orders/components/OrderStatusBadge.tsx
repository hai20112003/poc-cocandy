import { StatusBadge } from '@/components/shared/StatusBadge'
import type { OrderStatus } from '../types'

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple' }
> = {
  draft: { label: 'Draft', variant: 'default' },
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  in_transit: { label: 'In Transit', variant: 'info' },
  delivered: { label: 'Delivered', variant: 'purple' },
  overdue: { label: 'Overdue', variant: 'danger' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const c = STATUS_CONFIG[status]
  return <StatusBadge variant={c.variant}>{c.label}</StatusBadge>
}
