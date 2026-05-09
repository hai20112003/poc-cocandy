import { useMemo } from 'react'
import { Globe, Search } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { PageLayout } from '@/layouts/PageLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { useSources } from './hooks/useSources'
import { SourceStatusBadge, OnboardingStageBadge } from './components/SourceStatusBadge'
import { useFiltersStore } from '@/store/filtersStore'
import { useDebounce } from '@/hooks/useDebounce'
import { mockSuppliers } from '@/mock/suppliers'
import { cn } from '@/utils/cn'
import type { SupplierSource, SourceStatus } from './types'

const SUPPLIER_MAP = Object.fromEntries(mockSuppliers.map((s) => [s.id, s.name]))

const CHANNEL_LABELS: Record<string, string> = {
  direct: 'Direct',
  agent: 'Agent',
  marketplace: 'Marketplace',
  referral: 'Referral',
}

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pipeline', value: 'pipeline' },
  { label: 'Inactive', value: 'inactive' },
]

const COLUMNS: ColumnDef<SupplierSource, unknown>[] = [
  {
    accessorKey: 'supplierId',
    header: 'Supplier',
    cell: ({ getValue }) => (
      <span className="font-medium text-slate-800 dark:text-slate-200">
        {SUPPLIER_MAP[getValue<string>()] ?? getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
    cell: ({ getValue }) => (
      <span className="text-slate-600 dark:text-slate-400">
        {CHANNEL_LABELS[getValue<string>()] ?? getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'country',
    header: 'Country',
    cell: ({ getValue }) => <span className="text-slate-600 dark:text-slate-400">{getValue<string>()}</span>,
  },
  {
    accessorKey: 'region',
    header: 'Region',
    cell: ({ getValue }) => <span className="text-slate-500">{getValue<string>()}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <SourceStatusBadge status={getValue<SourceStatus>()} />,
  },
  {
    accessorKey: 'onboardingStage',
    header: 'Stage',
    cell: ({ getValue }) => <OnboardingStageBadge stage={getValue<SupplierSource['onboardingStage']>()} />,
  },
]

export function SourcesPage() {
  const f = useFiltersStore((s) => s.sources)
  const setFilter = useFiltersStore((s) => s.setFilter)
  const debouncedSearch = useDebounce(f.search, 300)
  const { sources, isLoading } = useSources()

  const filtered = useMemo(() => {
    return sources.filter((src) => {
      const matchesStatus = f.status === 'all' || src.status === f.status
      const matchesSearch =
        !debouncedSearch ||
        (SUPPLIER_MAP[src.supplierId] ?? '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        src.country.toLowerCase().includes(debouncedSearch.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [sources, f.status, debouncedSearch])

  return (
    <PageLayout>
      <PageHeader
        title="Supplier Sources"
        subtitle={isLoading ? 'Loading...' : `${filtered.length} sources`}
      />

      <div className="flex items-center gap-2">
        {/* Status tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter('sources', { status: tab.value })}
              className={cn(
                'px-3 py-1 rounded text-[11px] font-medium transition-colors',
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
        <div className="flex items-center gap-2 flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 max-w-xs">
          <Search className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by supplier or country..."
            value={f.search}
            onChange={(e) => setFilter('sources', { search: e.target.value })}
            className="flex-1 text-[11px] bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {!isLoading && filtered.length === 0 ? (
          <EmptyState icon={Globe} title="No sources found" description="Try adjusting filters" />
        ) : (
          <DataTable data={filtered} columns={COLUMNS} isLoading={isLoading} />
        )}
      </div>
    </PageLayout>
  )
}
