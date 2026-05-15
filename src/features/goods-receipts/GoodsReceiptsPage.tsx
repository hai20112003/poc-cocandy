import { useState, useMemo } from 'react'
import { Search, Eye, CheckCircle2, AlertCircle, Package, Receipt } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { PageLayout } from '@/layouts/PageLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { useGoodsReceipts } from './hooks/useGoodsReceipts'
import { GoodsReceiptDetailModal } from './components/GoodsReceiptDetailModal'
import { InvoiceDetailModal } from './components/InvoiceDetailModal'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import type { GoodsReceipt, Invoice } from './types'

const QC_STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  passed: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
}

const INVOICE_STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  partial: 'bg-blue-50 text-blue-700',
  paid: 'bg-green-50 text-green-700',
}

export function GoodsReceiptsPage() {
  const { goodsReceipts, invoices } = useGoodsReceipts()

  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'grn' | 'invoice'>('grn')
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceipt | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const filteredGRNs = useMemo(() => {
    if (!debouncedSearch) return goodsReceipts
    const q = debouncedSearch.toLowerCase()
    return goodsReceipts.filter(
      (grn) =>
        grn.code.toLowerCase().includes(q) ||
        grn.poCode.toLowerCase().includes(q) ||
        grn.supplierName.toLowerCase().includes(q) ||
        grn.items.some((item) => item.productName.toLowerCase().includes(q))
    )
  }, [goodsReceipts, debouncedSearch])

  const filteredInvoices = useMemo(() => {
    if (!debouncedSearch) return invoices
    const q = debouncedSearch.toLowerCase()
    return invoices.filter(
      (inv) =>
        inv.code.toLowerCase().includes(q) ||
        inv.poCode.toLowerCase().includes(q) ||
        inv.supplierName.toLowerCase().includes(q) ||
        inv.grnCodes.some((code) => code.toLowerCase().includes(q))
    )
  }, [invoices, debouncedSearch])

  function openGRNDetail(grn: GoodsReceipt) {
    setSelectedGRN(grn)
    setDetailModalOpen(true)
  }

  function openInvoiceDetail(inv: Invoice) {
    setSelectedInvoice(inv)
    setInvoiceModalOpen(true)
  }

  const grnColumns: ColumnDef<GoodsReceipt, unknown>[] = [
    {
      accessorKey: 'code',
      header: 'Mã GRN',
      cell: ({ getValue, row }) => (
        <button
          onClick={() => openGRNDetail(row.original)}
          className="font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          {getValue<string>()}
        </button>
      ),
    },
    {
      accessorKey: 'poCode',
      header: 'Liên kết PO',
      cell: ({ getValue }) => <span className="font-mono text-sm text-slate-600">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'supplierName',
      header: 'Nhà cung cấp',
      cell: ({ getValue }) => <span className="text-slate-700">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'receiveDate',
      header: 'Ngày nhận',
      cell: ({ getValue }) => <span className="text-slate-600">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'receivedBy',
      header: 'Người nhận',
      cell: ({ getValue }) => <span className="text-slate-600 text-sm">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'totalAccepted',
      header: 'Nhận/Chấp nhận',
      cell: ({ getValue, row }) => (
        <span>
          <span className="font-semibold text-slate-800">{row.original.totalReceived}</span>
          <span className="text-slate-400"> / </span>
          <span className="text-green-700 font-semibold">{getValue<number>()}</span>
        </span>
      ),
    },
    {
      accessorKey: 'qcStatus',
      header: 'QC',
      cell: ({ getValue }) => {
        const status = getValue<string>()
        const icons = {
          passed: <CheckCircle2 className="w-4 h-4" />,
          failed: <AlertCircle className="w-4 h-4" />,
          pending: <AlertCircle className="w-4 h-4" />,
        }
        return (
          <span className={cn('text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 w-fit', QC_STATUS_COLOR[status] ?? '')}>
            {icons[status as keyof typeof icons]}
            {status === 'passed' ? 'Đạt' : status === 'failed' ? 'Không đạt' : 'Chờ'}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <button
          onClick={() => openGRNDetail(row.original)}
          className="p-1 hover:bg-slate-100 rounded transition-colors"
          title="Xem chi tiết"
        >
          <Eye className="w-4 h-4 text-slate-600" />
        </button>
      ),
    },
  ]

  const invoiceColumns: ColumnDef<Invoice, unknown>[] = [
    {
      accessorKey: 'code',
      header: 'Mã Hóa đơn',
      cell: ({ getValue, row }) => (
        <button
          onClick={() => openInvoiceDetail(row.original)}
          className="font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          {getValue<string>()}
        </button>
      ),
    },
    {
      accessorKey: 'poCode',
      header: 'Liên kết PO',
      cell: ({ getValue }) => <span className="font-mono text-sm text-slate-600">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'supplierName',
      header: 'Nhà cung cấp',
      cell: ({ getValue }) => <span className="text-slate-700">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'invoiceDate',
      header: 'Ngày xuất',
      cell: ({ getValue }) => <span className="text-slate-600">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'dueDate',
      header: 'Hạn thanh toán',
      cell: ({ getValue }) => <span className="text-slate-600">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'total',
      header: 'Tổng tiền',
      cell: ({ getValue }) => (
        <span className="font-semibold text-slate-800">{getValue<number>().toLocaleString('vi-VN')} ₫</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái TT',
      cell: ({ getValue }) => {
        const status = getValue<string>()
        return (
          <span className={cn('text-xs font-semibold px-2 py-1 rounded', INVOICE_STATUS_COLOR[status] ?? '')}>
            {status === 'pending' ? 'Chờ TT' : status === 'partial' ? 'Tạm' : 'Đã TT'}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <button
          onClick={() => openInvoiceDetail(row.original)}
          className="p-1 hover:bg-slate-100 rounded transition-colors"
          title="Xem chi tiết"
        >
          <Eye className="w-4 h-4 text-slate-600" />
        </button>
      ),
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="GRN & Hóa đơn"
        subtitle="Quản lý phiếu nhập kho và hóa đơn nhà cung cấp"
      />

      {/* Tabs */}
      <div className="mb-4 border-b">
        <div className="flex gap-6">
          <button
            onClick={() => setTab('grn')}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              tab === 'grn'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            )}
          >
            Phiếu nhập kho (GRN)
            <span className="ml-2 text-sm bg-slate-100 px-2 py-0.5 rounded">{filteredGRNs.length}</span>
          </button>
          <button
            onClick={() => setTab('invoice')}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              tab === 'invoice'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            )}
          >
            Hóa đơn
            <span className="ml-2 text-sm bg-slate-100 px-2 py-0.5 rounded">{filteredInvoices.length}</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={tab === 'grn' ? 'Tìm kiếm GRN, PO, NCC...' : 'Tìm kiếm hóa đơn, PO...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      {tab === 'grn' ? (
        filteredGRNs.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Không có phiếu nhập kho"
            description="Chưa có GRN được tạo"
          />
        ) : (
          <DataTable columns={grnColumns} data={filteredGRNs} />
        )
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Không có hóa đơn"
          description="Chưa có hóa đơn được tạo"
        />
      ) : (
        <DataTable columns={invoiceColumns} data={filteredInvoices} />
      )}

      {selectedGRN && (
        <GoodsReceiptDetailModal open={detailModalOpen} onOpenChange={setDetailModalOpen} data={selectedGRN} />
      )}

      {selectedInvoice && (
        <InvoiceDetailModal open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen} data={selectedInvoice} />
      )}
    </PageLayout>
  )
}
