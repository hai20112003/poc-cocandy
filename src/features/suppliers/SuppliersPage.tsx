import { useMemo } from 'react'
import { Building2, Search } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { PageLayout } from '@/layouts/PageLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { useSuppliers } from './hooks/useSuppliers'
import { useFiltersStore } from '@/store/filtersStore'
import { useDebounce } from '@/hooks/useDebounce'
import type { Supplier } from './types'

const COLUMNS: ColumnDef<Supplier, unknown>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ getValue }) => (
      <span className="font-mono text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => (
      <span className="font-medium text-slate-800 dark:text-slate-200">{getValue<string>()}</span>
    ),
  },
]

export function SuppliersPage() {
  const { suppliers: f, setFilter } = useFiltersStore((s) => ({
    suppliers: s.suppliers,
    setFilter: s.setFilter,
  }))
  const debouncedSearch = useDebounce(f.search, 300)
  const { suppliers, isLoading } = useSuppliers()

  const filtered = useMemo(() => {
    if (!debouncedSearch) return suppliers
    const q = debouncedSearch.toLowerCase()
    return suppliers.filter(
      (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    )
  }, [suppliers, debouncedSearch])

  return (
    <PageLayout>
      <PageHeader
        title="Suppliers"
        subtitle={isLoading ? 'Loading...' : `${filtered.length} suppliers`}
      />

      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 max-w-sm">
        <Search className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search suppliers..."
          value={f.search}
          onChange={(e) => setFilter('suppliers', { search: e.target.value })}
          className="flex-1 text-[11px] bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {!isLoading && filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No suppliers found"
            description="Try a different search term"
          />
        ) : (
          <DataTable
            data={filtered}
            columns={COLUMNS}
            isLoading={isLoading}
          />
        )}
      </div>
    </PageLayout>
  )
}
