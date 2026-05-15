import { Modal } from '@/components/shared/Modal'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import type { PurchaseRequest } from '../types'

interface PurchaseRequestDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PurchaseRequest
}

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Thấp',
  medium: 'Bình thường',
  high: 'Cao',
}

export function PurchaseRequestDetailModal({ open, onOpenChange, data }: PurchaseRequestDetailModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`Chi tiết yêu cầu mua hàng: ${data.code}`}>
      <div className="space-y-4">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded border">
          <div>
            <div className="text-xs text-slate-600">Mã PR</div>
            <div className="font-semibold text-slate-800">{data.code}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600">Trạng thái</div>
            <div>
              <StatusBadge status={data.status} />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-600">Bộ phận</div>
            <div className="font-medium text-slate-800">{data.department}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600">Cần hàng lúc</div>
            <div className="font-medium text-slate-800">{data.neededDate}</div>
          </div>
        </div>

        {/* Priority & Dates */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded border">
            <div className="text-xs text-slate-600 mb-1">Ưu tiên</div>
            <div className="font-semibold text-slate-800">{PRIORITY_LABEL[data.priority]}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded border">
            <div className="text-xs text-slate-600 mb-1">Người tạo</div>
            <div className="font-semibold text-slate-800">{data.createdBy}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded border">
            <div className="text-xs text-slate-600 mb-1">Ngày tạo</div>
            <div className="font-semibold text-slate-800">{data.createdAt}</div>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Chi tiết sản phẩm ({data.items.length} dòng)</h4>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="px-3 py-2 text-left font-semibold">#</th>
                  <th className="px-3 py-2 text-left font-semibold">Sản phẩm</th>
                  <th className="px-3 py-2 text-left font-semibold">Đặc tả</th>
                  <th className="px-3 py-2 text-right font-semibold">SL</th>
                  <th className="px-3 py-2 text-left font-semibold">Đơn vị</th>
                  <th className="px-3 py-2 text-right font-semibold">Giá ước tính</th>
                  <th className="px-3 py-2 text-right font-semibold">Thành tiền</th>
                  <th className="px-3 py-2 text-left font-semibold">NCC gợi ý</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-600">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium text-slate-800">{item.productName}</td>
                    <td className="px-3 py-2 text-slate-600 text-xs">{item.specification}</td>
                    <td className="px-3 py-2 text-right font-medium">{item.quantity}</td>
                    <td className="px-3 py-2 text-slate-600">{item.unit}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{item.estimatedPrice.toLocaleString('vi-VN')} ₫</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-800">
                      {(item.quantity * item.estimatedPrice).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-3 py-2 text-slate-600 text-xs">{item.suggestedSupplier || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-indigo-50 rounded border border-indigo-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-800">Tổng giá trị ước tính:</span>
            <span className="font-bold text-lg text-indigo-600">{data.totalEstimated.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>

        {/* Approval Info */}
        {data.approvedAt && (
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <div className="text-xs text-green-700 font-semibold mb-1">✓ Đã phê duyệt</div>
            <div className="text-sm">
              <div>Người duyệt: <span className="font-medium">{data.approvedBy}</span></div>
              <div>Ngày duyệt: <span className="font-medium">{data.approvedAt}</span></div>
            </div>
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Ghi chú</h4>
            <div className="p-3 bg-slate-50 rounded border text-sm text-slate-700">{data.notes}</div>
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
