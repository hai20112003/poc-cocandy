import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, ShoppingCart } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { PageLayout } from '@/layouts/PageLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { OrderModal } from './components/OrderModal'
import { OrderStatusBadge } from './components/OrderStatusBadge'
import { useOrders } from './hooks/useOrders'
import { useOrdersStore } from '@/store/ordersStore'
import { useSuppliersStore } from '@/store/suppliersStore'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/utils/cn'
import type { Order } from './types'

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đã đặt', value: 'Đã đặt' },
  { label: 'Đang giao', value: 'Đang giao' },
  { label: 'Đã về khớp', value: 'Đã về khớp' },
  { label: 'Về một phần', value: 'Về một phần' },
  { label: 'Về lệch bill', value: 'Về lệch bill' },
]

function orderTotals(order: Order): Record<string, number> {
  return order.items.reduce(
    (acc, item) => {
      acc[item.currency] = (acc[item.currency] ?? 0) + item.totalAmount
      return acc
    },
    {} as Record<string, number>
  )
}

export function OrdersPage() {
  const { orders, isLoading } = useOrders()
  const { add, update } = useOrdersStore()
  const suppliers = useSuppliersStore((s) => s.suppliers)
  const supplierMap = useMemo(
    () => Object.fromEntries(suppliers.map((s) => [s.id, { mccCode: s.mccCode, name: s.name }])),
    [suppliers]
  )

  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Order | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = activeStatus === 'all' || o.status === activeStatus
      if (!matchStatus) return false
      if (!debouncedSearch) return true
      const q = debouncedSearch.toLowerCase()
      const sup = supplierMap[o.supplierId]
      return (
        o.id.toLowerCase().includes(q) ||
        (sup?.mccCode ?? '').toLowerCase().includes(q) ||
        (sup?.name ?? '').toLowerCase().includes(q) ||
        o.items.some(
          (item) =>
            item.productName.toLowerCase().includes(q) ||
            item.productCode.toLowerCase().includes(q)
        )
      )
    })
  }, [orders, activeStatus, debouncedSearch, supplierMap])

  function openAdd() { setSelected(null); setModalOpen(true) }
  function openEdit(o: Order) { setSelected(o); setModalOpen(true) }
  function handleSave(data: Omit<Order, 'id' | 'createdAt'>) {
    if (selected) update(selected.id, data); else add(data)
  }

  const columns: ColumnDef<Order, unknown>[] = [
    {
      accessorKey: 'id',
      header: 'Mã đơn',
      cell: ({ getValue }) => (
        <span className="font-mono text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'supplierId',
      header: 'Nhà cung cấp',
      cell: ({ getValue }) => {
        const sup = supplierMap[getValue<string>()]
        return (
          <div className="leading-tight">
            <div className="font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">
              {sup?.mccCode ?? getValue<string>()}
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{sup?.name}</div>
          </div>
        )
      },
    },
    {
      id: 'orderDate',
      header: 'Ngày đặt',
      cell: ({ row }) => {
        const dates = row.original.items.map((i) => i.orderDate).filter(Boolean).sort()
        if (!dates.length) return <span className="text-slate-300 dark:text-slate-600">—</span>
        const first = dates[0]
        const last = dates[dates.length - 1]
        return (
          <span className="text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
            {first === last ? first : `${first} – ${last}`}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ getValue }) => <OrderStatusBadge status={getValue<Order['status']>()} />,
    },
    {
      id: 'items',
      header: 'Mặt hàng',
      cell: ({ row }) => {
        const count = row.original.items.length
        return (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {count} <span className="text-slate-400">mặt hàng</span>
          </span>
        )
      },
    },
    {
      id: 'totalAmount',
      header: 'Tổng tiền',
      cell: ({ row }) => {
        const totals = orderTotals(row.original)
        const entries = Object.entries(totals)
        if (entries.length === 0) return <span className="text-slate-300">—</span>
        return (
          <div className="space-y-0.5">
            {entries.map(([currency, amount]) => (
              <div key={currency} className="text-[11px] font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                {amount.toLocaleString('vi-VN')}{' '}
                <span className="text-[9px] font-normal text-slate-400">{currency}</span>
              </div>
            ))}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={(e) => { e.stopPropagation(); openEdit(row.original) }}
          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
          title="Chỉnh sửa"
        >
          <Pencil className="w-3 h-3" />
        </button>
      ),
      size: 40,
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Đơn hàng"
        subtitle={isLoading ? 'Đang tải...' : `${filtered.length} đơn hàng`}
        actions={
          <button
            onClick={openAdd}
            className="px-3 py-1.5 text-[11px] font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo đơn mới
          </button>
        }
      />

      <div className="flex flex-col gap-2">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-0.5 w-fit">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={cn(
                'px-3 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap',
                activeStatus === tab.value
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 max-w-sm">
          <Search className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên hàng, NCC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-[11px] bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {!isLoading && filtered.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Không tìm thấy đơn hàng"
            description="Thử từ khóa khác hoặc tạo đơn hàng mới"
            action={
              <button onClick={openAdd} className="px-3 py-1.5 text-[11px] font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                Tạo đơn mới
              </button>
            }
          />
        ) : (
          <DataTable data={filtered} columns={columns} isLoading={isLoading} onRowClick={openEdit} />
        )}
      </div>

      <OrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        order={selected}
        onSave={handleSave}
      />
    </PageLayout>
  )
}
