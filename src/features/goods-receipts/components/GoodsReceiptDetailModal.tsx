import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import type { GoodsReceipt } from '../types'

interface GoodsReceiptDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: GoodsReceipt
}

const QC_STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ kiểm tra',
  passed: 'Đạt',
  failed: 'Không đạt',
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Nháp',
  received: 'Đã nhận',
  confirmed: 'Xác nhận',
}

export function GoodsReceiptDetailModal({ open, onOpenChange, data }: GoodsReceiptDetailModalProps) {
  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title={`Chi tiết phiếu nhập kho: ${data.code}`}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Header Info Section */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded border">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Mã GRN</div>
            <div className="font-semibold text-slate-800">{data.code}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Liên kết PO</div>
            <div className="font-semibold text-indigo-600">{data.poCode}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Nhà cung cấp</div>
            <div className="font-medium text-slate-800">{data.supplierName}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Ngày nhận</div>
            <div className="font-medium text-slate-800">{data.receiveDate}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Người nhận</div>
            <div className="font-medium text-slate-800">{data.receivedBy || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Trạng thái</div>
            <div className="font-medium text-slate-800">{STATUS_LABEL[data.status]}</div>
          </div>
        </div>

        {/* Transportation Info Section - Conditional */}
        {data.transportationUnit && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded border border-blue-200">
            <div>
              <div className="text-xs font-semibold text-blue-600 mb-1">Đơn vị vận chuyển</div>
              <div className="font-medium text-slate-800">{data.transportationUnit}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-600 mb-1">Mã vận đơn</div>
              <div className="font-medium text-slate-800">{data.trackingNumber || '—'}</div>
            </div>
          </div>
        )}

        {/* Items Section */}
        <div>
          <h4 className="font-semibold text-sm mb-3">Chi tiết hàng nhận ({data.items.length} dòng)</h4>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="px-3 py-2 text-left font-semibold">#</th>
                  <th className="px-3 py-2 text-left font-semibold">Tên hàng</th>
                  <th className="px-3 py-2 text-center font-semibold">SL đặt</th>
                  <th className="px-3 py-2 text-center font-semibold">Nhận</th>
                  <th className="px-3 py-2 text-center font-semibold">Chấp nhận</th>
                  <th className="px-3 py-2 text-center font-semibold">Từ chối</th>
                  <th className="px-3 py-2 text-left font-semibold">Lô / Vị trí</th>
                  <th className="px-3 py-2 text-left font-semibold">QC Note</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-600">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      <div>{item.productName}</div>
                      <div className="text-xs text-slate-500">{item.specification}</div>
                    </td>
                    <td className="px-3 py-2 text-center">{item.orderedQuantity}</td>
                    <td className="px-3 py-2 text-center font-medium">{item.receivedQuantity}</td>
                    <td className="px-3 py-2 text-center font-medium text-green-700">{item.acceptedQuantity}</td>
                    <td className="px-3 py-2 text-center font-medium text-red-700">{item.rejectedQuantity}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      <div>{item.lotNumber}</div>
                      <div>{item.warehouseLocation}</div>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">{item.qcNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded border">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Tổng nhận</div>
            <div className="font-bold text-lg text-slate-800">{data.totalReceived}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-green-600 mb-1">Chấp nhận</div>
            <div className="font-bold text-lg text-green-700">{data.totalAccepted}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-red-600 mb-1">Từ chối</div>
            <div className="font-bold text-lg text-red-700">{data.totalRejected}</div>
          </div>
        </div>

        {/* QC Status Section */}
        <div className={`p-4 rounded border ${
          data.qcStatus === 'passed' ? 'bg-green-50 border-green-200' :
          data.qcStatus === 'failed' ? 'bg-red-50 border-red-200' :
          'bg-amber-50 border-amber-200'
        }`}>
          <div className="text-sm font-semibold">
            {data.qcStatus === 'passed' ? '✓' : data.qcStatus === 'failed' ? '✕' : '⏳'} QC: {QC_STATUS_LABEL[data.qcStatus]}
          </div>
        </div>

        {/* Notes Section - Conditional */}
        {data.notes && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Ghi chú</h4>
            <div className="p-4 bg-slate-50 rounded border text-sm text-slate-700">{data.notes}</div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>
      </div>
    </Modal>
  )
}
