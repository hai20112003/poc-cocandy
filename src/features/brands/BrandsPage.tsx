import { useMemo } from 'react'
import { Tag, Search } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { PageLayout } from '@/layouts/PageLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { useBrands } from './hooks/useBrands'
import { useFiltersStore } from '@/store/filtersStore'
import { useDebounce } from '@/hooks/useDebounce'
import type { Brand } from './types'

const COLUMNS: ColumnDef<Brand, unknown>[] = [
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

export function BrandsPage() {
  const { brands: f, setFilter } = useFiltersStore((s) => ({
    brands: s.brands,
    setFilter: s.setFilter,
  }))
  const debouncedSearch = useDebounce(f.search, 300)
  const { brands, isLoading } = useBrands()

  const filtered = useMemo(() => {
    if (!debouncedSearch) return brands
    const q = debouncedSearch.toLowerCase()
    return brands.filter(
      (b) => b.code.toLowerCase().includes(q) || b.name.toLowerCase().includes(q)
    )
  }, [brands, debouncedSearch])

  return (
    <PageLayout>
      <PageHeader
        title="Brands"
        subtitle={isLoading ? 'Loading...' : `${filtered.length} brands`}
      />

      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 max-w-sm">
        <Search className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search brands..."
          value={f.search}
          onChange={(e) => setFilter('brands', { search: e.target.value })}
          className="flex-1 text-[11px] bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {!isLoading && filtered.length === 0 ? (
          <EmptyState icon={Tag} title="No brands found" description="Try a different search term" />
        ) : (
          <DataTable data={filtered} columns={COLUMNS} isLoading={isLoading} />
        )}
      </div>
    </PageLayout>
  )
}
