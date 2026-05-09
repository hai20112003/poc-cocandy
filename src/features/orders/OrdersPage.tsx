import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { PageLayout } from '@/layouts/PageLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { OrderTable } from './components/OrderTable'
import { OrderDrawer } from './components/OrderDrawer'
import { useOrders } from './hooks/useOrders'
import { useFiltersStore } from '@/store/filtersStore'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/utils/cn'
import type { Order } from './types'

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Delivered', value: 'delivered' },
]

export function OrdersPage() {
  const { orders: f, setFilter } = useFiltersStore((s) => ({
    orders: s.orders,
    setFilter: s.setFilter,
  }))
  const debouncedSearch = useDebounce(f.search, 300)
  const { orders, isLoading, total } = useOrders({ search: debouncedSearch, status: f.status })

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleRowClick(order: Order) {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  return (
    <PageLayout>
      <PageHeader
        title="Purchase Orders"
        subtitle={isLoading ? 'Loading...' : `${total} orders total · ${orders.length} shown`}
        actions={
          <>
            <button className="px-3 py-1.5 text-[11px] font-medium border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Export
            </button>
            <button className="px-3 py-1.5 text-[11px] font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New Order
            </button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter('orders', { status: tab.value })}
              className={cn(
                'px-3 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap',
                f.status === tab.value
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5">
          <Search className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by order ID or supplier..."
            value={f.search}
            onChange={(e) => setFilter('orders', { search: e.target.value })}
            className="flex-1 text-[11px] bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <OrderTable data={orders} isLoading={isLoading} onRowClick={handleRowClick} />
      </div>

      <OrderDrawer
        order={selectedOrder}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </PageLayout>
  )
}
