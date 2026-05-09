import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/DataTable'
import { OrderStatusBadge } from './OrderStatusBadge'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { mockSuppliers } from '@/mock/suppliers'
import { mockBrands } from '@/mock/brands'
import type { Order } from '../types'

const SUPPLIER_MAP = Object.fromEntries(mockSuppliers.map((s) => [s.id, s.name]))
const BRAND_MAP = Object.fromEntries(mockBrands.map((b) => [b.id, b.name]))

const COLUMNS: ColumnDef<Order, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'supplierId',
    header: 'Supplier',
    cell: ({ getValue }) => (
      <span className="text-slate-700 dark:text-slate-300">
        {SUPPLIER_MAP[getValue<string>()] ?? getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'brandId',
    header: 'Brand',
    cell: ({ getValue }) => (
      <span className="text-slate-500">{BRAND_MAP[getValue<string>()] ?? getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="font-medium text-slate-800 dark:text-slate-200">
        {formatCurrency(row.original.amount, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: 'expectedDate',
    header: 'Expected',
    cell: ({ getValue }) => (
      <span className="text-slate-500">{formatDate(getValue<string>())}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <OrderStatusBadge status={getValue<Order['status']>()} />,
  },
]

interface OrderTableProps {
  data: Order[]
  isLoading: boolean
  onRowClick?: (order: Order) => void
}

export function OrderTable({ data, isLoading, onRowClick }: OrderTableProps) {
  return (
    <DataTable
      data={data}
      columns={COLUMNS}
      isLoading={isLoading}
      onRowClick={onRowClick}
    />
  )
}
