import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { Invoice } from '../types'

interface InvoiceDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: Invoice
}

export function InvoiceDetailModal({ open, onOpenChange, data }: InvoiceDetailModalProps) {
  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title={`Chi tiết hóa đơn: ${data.code}`}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Header Info Section */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded border">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Mã Hóa đơn</div>
            <div className="font-semibold text-slate-800">{data.code}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Trạng thái TT</div>
            <div>
              <StatusBadge variant={data.status?.toLowerCase() === 'paid' ? 'success' : data.status?.toLowerCase() === 'partial' ? 'warning' : 'info'}>
                {data.status === 'paid' ? 'Đã TT' : data.status === 'partial' ? 'Tạm' : 'Chờ TT'}
              </StatusBadge>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Liên kết PO</div>
            <div className="font-medium text-slate-800">{data.poCode}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Nhà cung cấp</div>
            <div className="font-medium text-slate-800">{data.supplierName}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Ngày xuất</div>
            <div className="font-medium text-slate-800">{data.invoiceDate}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Hạn thanh toán</div>
            <div className="font-medium text-slate-800">{data.dueDate}</div>
          </div>
        </div>

        {/* Amounts Section */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded border">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Tổng tiền</div>
            <div className="font-bold text-lg text-slate-800">{data.total.toLocaleString('vi-VN')} ₫</div>
          </div>
          <div>
            <div className="text-xs font-medium text-green-600 mb-1">Đã thanh toán</div>
            <div className="font-bold text-lg text-green-700">{(data.paid || 0).toLocaleString('vi-VN')} ₫</div>
          </div>
          <div>
            <div className="text-xs font-medium text-amber-600 mb-1">Còn lại</div>
            <div className="font-bold text-lg text-amber-700">{(data.total - (data.paid || 0)).toLocaleString('vi-VN')} ₫</div>
          </div>
        </div>

        {/* Items Section - Linked GRNs */}
        <div>
          <h4 className="font-semibold text-sm mb-3">Phiếu nhập kho liên kết ({data.grnCodes?.length || 0})</h4>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="px-3 py-2 text-left font-semibold">Mã GRN</th>
                  <th className="px-3 py-2 text-left font-semibold">Nhà cung cấp</th>
                </tr>
              </thead>
              <tbody>
                {data.grnCodes?.map((code, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-indigo-600">{code}</td>
                    <td className="px-3 py-2 text-slate-600">—</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={2} className="px-3 py-2 text-slate-500 text-center">Không có GRN liên kết</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Section - Invoice Details */}
        <div>
          <h4 className="font-semibold text-sm mb-3">Chi tiết hàng hóa ({data.items?.length || 0} dòng)</h4>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="px-3 py-2 text-left font-semibold">#</th>
                  <th className="px-3 py-2 text-left font-semibold">Tên sản phẩm</th>
                  <th className="px-3 py-2 text-center font-semibold">SL</th>
                  <th className="px-3 py-2 text-left font-semibold">Đơn vị</th>
                  <th className="px-3 py-2 text-right font-semibold">Đơn giá</th>
                  <th className="px-3 py-2 text-right font-semibold">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {data.items?.map((item, idx) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-600">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium text-slate-800">{item.productName}</td>
                    <td className="px-3 py-2 text-center">{item.quantity}</td>
                    <td className="px-3 py-2 text-slate-600">{item.unit}</td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {item.unitPrice.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-800">
                      {item.totalAmount.toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={6} className="px-3 py-2 text-slate-500 text-center">Không có hàng hóa</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded border">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Tạm tính</div>
            <div className="font-medium text-slate-800">{(data.subtotal || 0).toLocaleString('vi-VN')} ₫</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Thuế VAT</div>
            <div className="font-medium text-slate-800">{(data.vat || 0).toLocaleString('vi-VN')} ₫</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Chiết khấu</div>
            <div className="font-medium text-green-700">{(data.discount || 0).toLocaleString('vi-VN')} ₫</div>
          </div>
        </div>

        {/* Payment Info Section - Conditional */}
        {data.paid && data.paid > 0 && (
          <div className="p-4 bg-green-50 rounded border border-green-200">
            <div className="text-sm font-semibold text-green-700 mb-2">✓ Đã thanh toán</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-green-600 font-medium mb-1">Số tiền</div>
                <div className="font-medium text-slate-800">{data.paid.toLocaleString('vi-VN')} ₫</div>
              </div>
              <div>
                <div className="text-xs text-green-600 font-medium mb-1">Ngày thanh toán</div>
                <div className="font-medium text-slate-800">{data.paidDate || '—'}</div>
              </div>
            </div>
          </div>
        )}

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
