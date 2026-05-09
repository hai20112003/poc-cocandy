import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { LoadingSkeleton } from './LoadingSkeleton'
import { EmptyState } from './EmptyState'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, unknown>[]
  isLoading?: boolean
  onRowClick?: (row: T) => void
  globalFilter?: string
  pageSize?: number
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  onRowClick,
  globalFilter,
  pageSize = 20,
}: DataTableProps<T>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [globalFilter])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter: globalFilter ?? '',
      pagination,
    },
    onGlobalFilterChange: () => {},
    onPaginationChange: setPagination,
  })

  if (isLoading) {
    return <LoadingSkeleton rows={8} columns={columns.length} />
  }

  const rows = table.getRowModel().rows
  const totalRows = table.getFilteredRowModel().rows.length

  return (
    <div>
      <table className="w-full border-collapse text-[11px]">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr
              key={hg.id}
              className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700"
            >
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-[7px] text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  icon={Search}
                  title="No results"
                  description="Try adjusting your search or filter"
                />
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  'border-b border-slate-100 dark:border-slate-800 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-[5px] text-slate-700 dark:text-slate-300">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-700">
        <span className="text-[10px] text-slate-500">
          {totalRows === 0
            ? 'No rows'
            : `${pagination.pageIndex * pageSize + 1}–${Math.min((pagination.pageIndex + 1) * pageSize, totalRows)} of ${totalRows}`}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
