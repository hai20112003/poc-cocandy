import { useState, useMemo } from 'react'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { PageLayout } from '@/layouts/PageLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PurchaseRequestModal } from './components/PurchaseRequestModal'
import { PurchaseRequestDetailModal } from './components/PurchaseRequestDetailModal'
import { usePurchaseRequests } from './hooks/usePurchaseRequests'
import { usePurchaseRequestsStore } from '@/store/purchaseRequestsStore'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { PurchaseRequest } from './types'

const PRIORITY_COLOR: Record<string, string> = {
  low: 'bg-blue-50 text-blue-700',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-700',
}

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Thấp',
  medium: 'Bình thường',
  high: 'Cao',
}

export function PurchaseRequestsPage() {
  const { purchaseRequests } = usePurchaseRequests()
  const { add, update, remove } = usePurchaseRequestsStore()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selected, setSelected] = useState<PurchaseRequest | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const filtered = useMemo(() => {
    if (!debouncedSearch) return purchaseRequests
    const q = debouncedSearch.toLowerCase()
    return purchaseRequests.filter(
      (pr) =>
        pr.code.toLowerCase().includes(q) ||
        pr.department.toLowerCase().includes(q) ||
        pr.createdBy.toLowerCase().includes(q) ||
        pr.items.some((item) => item.productName.toLowerCase().includes(q))
    )
  }, [purchaseRequests, debouncedSearch])

  function openAdd() {
    setSelected(null)
    setModalOpen(true)
  }

  function openEdit(pr: PurchaseRequest) {
    setSelected(pr)
    setModalOpen(true)
  }

  function openDetail(pr: PurchaseRequest) {
    setSelected(pr)
    setDetailModalOpen(true)
  }

  function handleSave(data: Omit<PurchaseRequest, 'id' | 'createdAt'>) {
    if (selected) {
      update(selected.id, data)
    } else {
      add(data)
    }
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    if (confirm('Bạn chắc chắn muốn xóa?')) {
      remove(id)
    }
  }

  const columns: ColumnDef<PurchaseRequest, unknown>[] = [
    {
      accessorKey: 'code',
      header: 'Mã PR',
      cell: ({ getValue, row }) => (
        <button
          onClick={() => openDetail(row.original)}
          className="font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          {getValue<string>()}
        </button>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Bộ phận',
      cell: ({ getValue }) => <span className="text-slate-700">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'neededDate',
      header: 'Cần hàng lúc',
      cell: ({ getValue }) => <span className="text-slate-600">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'priority',
      header: 'Ưu tiên',
      cell: ({ getValue }) => {
        const priority = getValue<string>()
        return (
          <span className={cn('text-xs font-semibold px-2 py-1 rounded', PRIORITY_COLOR[priority])}>
            {PRIORITY_LABEL[priority]}
          </span>
        )
      },
    },
    {
      accessorKey: 'totalEstimated',
      header: 'Tổng ước tính',
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<number>().toLocaleString('vi-VN')} ₫</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
    {
      accessorKey: 'createdBy',
      header: 'Người tạo',
      cell: ({ getValue }) => <span className="text-slate-600 text-sm">{getValue<string>()}</span>,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={() => openDetail(row.original)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4 text-slate-600" />
          </button>
          {row.original.status === 'draft' && (
            <>
              <button
                onClick={() => openEdit(row.original)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                title="Chỉnh sửa"
              >
                <Pencil className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => handleDelete(row.original.id)}
                className="p-1 hover:bg-red-50 rounded transition-colors"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Danh sách yêu cầu mua hàng"
        description="Quản lý các yêu cầu mua hàng từ các bộ phận"
        action={
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" /> Tạo mới
          </Button>
        }
      />

      <div className="mb-4 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm theo mã, bộ phận, sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Không có yêu cầu mua hàng"
          description="Hãy tạo yêu cầu mua hàng đầu tiên"
          action={<Button onClick={openAdd}>Tạo mới</Button>}
        />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}

      <PurchaseRequestModal open={modalOpen} onOpenChange={setModalOpen} onSave={handleSave} data={selected ?? undefined} />

      {selected && (
        <PurchaseRequestDetailModal open={detailModalOpen} onOpenChange={setDetailModalOpen} data={selected} />
      )}
    </PageLayout>
  )
}
