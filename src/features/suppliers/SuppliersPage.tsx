import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Users } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { PageLayout } from '@/layouts/PageLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { SupplierModal } from './components/SupplierModal'
import { useSuppliers } from './hooks/useSuppliers'
import { useSuppliersStore } from '@/store/suppliersStore'
import { useBrandsStore } from '@/store/brandsStore'
import { useSupplierSourcesStore } from '@/store/supplierSourcesStore'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/utils/cn'
import type { Supplier } from './types'

const CATEGORY_COLOR: Record<string, string> = {
  NPL: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  'Thành phẩm': 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
}

function CategoryBadges({ cats }: { cats: string[] }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {cats.map((c) => (
        <span key={c} className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded', CATEGORY_COLOR[c] ?? 'bg-slate-100 text-slate-600')}>
          {c}
        </span>
      ))}
    </div>
  )
}

function TruncatedList({ items, max = 2 }: { items: string[]; max?: number }) {
  if (items.length === 0) return <span className="text-slate-300 dark:text-slate-600 text-[10px]">—</span>
  const shown = items.slice(0, max)
  const rest = items.length - max
  return (
    <span className="text-slate-600 dark:text-slate-400">
      {shown.join(', ')}
      {rest > 0 && <span className="text-slate-400"> +{rest}</span>}
    </span>
  )
}

export function SuppliersPage() {
  const { suppliers, isLoading } = useSuppliers()
  const { add, update } = useSuppliersStore()
  const brands = useBrandsStore((s) => s.brands)
  const supplierSources = useSupplierSourcesStore((s) => s.supplierSources)

  const brandMap = useMemo(() => Object.fromEntries(brands.map((b) => [b.id, b.name])), [brands])
  const sourceMap = useMemo(() => Object.fromEntries(supplierSources.map((ss) => [ss.id, ss.name])), [supplierSources])

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Supplier | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const filtered = useMemo(() => {
    if (!debouncedSearch) return suppliers
    const q = debouncedSearch.toLowerCase()
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.mccCode.toLowerCase().includes(q) ||
        s.brandIds.some((id) => (brandMap[id] ?? '').toLowerCase().includes(q)) ||
        s.supplierSourceIds.some((id) => (sourceMap[id] ?? '').toLowerCase().includes(q)) ||
        s.productCategories.some((c) => c.toLowerCase().includes(q)) ||
        (s.nccInfo ?? '').toLowerCase().includes(q)
    )
  }, [suppliers, debouncedSearch, brandMap, sourceMap])

  function openAdd() { setSelected(null); setModalOpen(true) }
  function openEdit(s: Supplier) { setSelected(s); setModalOpen(true) }
  function handleSave(data: Omit<Supplier, 'id'>) {
    if (selected) update(selected.id, data); else add(data)
  }

  const columns: ColumnDef<Supplier, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Tên nhà cung cấp',
      cell: ({ getValue }) => (
        <span className="font-medium text-slate-800 dark:text-slate-200">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'mccCode',
      header: 'Mã MCC',
      cell: ({ getValue }) => (
        <span className="font-mono text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'brandIds',
      header: 'Branch',
      cell: ({ getValue }) => (
        <TruncatedList items={(getValue<string[]>()).map((id) => brandMap[id] ?? id)} />
      ),
    },
    {
      accessorKey: 'supplierSourceIds',
      header: 'Suppliers-sources',
      cell: ({ getValue }) => (
        <TruncatedList items={(getValue<string[]>()).map((id) => sourceMap[id] ?? id)} />
      ),
    },
    {
      accessorKey: 'productCategories',
      header: 'Loại mặt hàng',
      cell: ({ getValue }) => <CategoryBadges cats={getValue<string[]>()} />,
    },
    {
      accessorKey: 'qrImageUrl',
      header: 'QR nhóm trao đổi',
      cell: ({ getValue }) => {
        const url = getValue<string | undefined>()
        return url
          ? <img src={url} alt="QR" className="w-8 h-8 object-contain rounded border border-slate-200 dark:border-slate-700" />
          : <span className="text-slate-300 dark:text-slate-600 text-[10px]">—</span>
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
        title="Nhà cung cấp"
        subtitle={isLoading ? 'Đang tải...' : `${filtered.length} nhà cung cấp`}
        actions={
          <button
            onClick={openAdd}
            className="px-3 py-1.5 text-[11px] font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm mới
          </button>
        }
      />

      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 max-w-sm">
        <Search className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Tìm theo MCC, branch, loại mặt hàng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-[11px] bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {!isLoading && filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Không tìm thấy nhà cung cấp"
            description="Thử từ khóa khác hoặc thêm mới"
            action={
              <button
                onClick={openAdd}
                className="px-3 py-1.5 text-[11px] font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Thêm nhà cung cấp mới
              </button>
            }
          />
        ) : (
          <DataTable data={filtered} columns={columns} isLoading={isLoading} onRowClick={openEdit} />
        )}
      </div>

      <SupplierModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        supplier={selected}
        onSave={handleSave}
      />
    </PageLayout>
  )
}
