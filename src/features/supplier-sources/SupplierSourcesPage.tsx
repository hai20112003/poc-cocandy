import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Network } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { PageLayout } from '@/layouts/PageLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { SupplierSourceModal } from './components/SupplierSourceModal'
import { useSupplierSources } from './hooks/useSupplierSources'
import { useSupplierSourcesStore } from '@/store/supplierSourcesStore'
import { useDebounce } from '@/hooks/useDebounce'
import type { SupplierSource } from './types'

export function SupplierSourcesPage() {
  const { supplierSources, isLoading } = useSupplierSources()
  const { add, update } = useSupplierSourcesStore()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<SupplierSource | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const filtered = useMemo(() => {
    if (!debouncedSearch) return supplierSources
    const q = debouncedSearch.toLowerCase()
    return supplierSources.filter(
      (ss) => ss.code.toLowerCase().includes(q) || ss.name.toLowerCase().includes(q)
    )
  }, [supplierSources, debouncedSearch])

  function openAdd() {
    setSelected(null)
    setModalOpen(true)
  }

  function openEdit(ss: SupplierSource) {
    setSelected(ss)
    setModalOpen(true)
  }

  function handleSave(data: Omit<SupplierSource, 'id'>) {
    if (selected) {
      update(selected.id, data)
    } else {
      add(data)
    }
  }

  const columns: ColumnDef<SupplierSource, unknown>[] = [
    {
      accessorKey: 'code',
      header: 'Mã code',
      cell: ({ getValue }) => (
        <span className="font-mono text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Tên Supplier-source',
      cell: ({ getValue }) => (
        <span className="font-medium text-slate-800 dark:text-slate-200">{getValue<string>()}</span>
      ),
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
        title="Suppliers-sources"
        subtitle={isLoading ? 'Đang tải...' : `${filtered.length} sources`}
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
          placeholder="Tìm kiếm supplier-source..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-[11px] bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {!isLoading && filtered.length === 0 ? (
          <EmptyState
            icon={Network}
            title="Không tìm thấy supplier-source"
            description="Thử từ khóa khác hoặc thêm mới"
            action={
              <button
                onClick={openAdd}
                className="px-3 py-1.5 text-[11px] font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Thêm supplier-source mới
              </button>
            }
          />
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            isLoading={isLoading}
            onRowClick={openEdit}
          />
        )}
      </div>

      <SupplierSourceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        supplierSource={selected}
        onSave={handleSave}
      />
    </PageLayout>
  )
}
