import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import type { Invoice } from '../types'

interface InvoiceDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: Invoice
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ thanh toán',
  partial: 'Thanh toán tạm',
  paid: 'Đã thanh toán',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 border-amber-200 text-amber-700',
  partial: 'bg-blue-50 border-blue-200 text-blue-700',
  paid: 'bg-green-50 border-green-200 text-green-700',
}

export function InvoiceDetailModal({ open, onOpenChange, data }: InvoiceDetailModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`Chi tiết hóa đơn: ${data.code}`}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded border">
          <div>
            <div className="text-xs text-slate-600">Mã hóa đơn</div>
            <div className="font-semibold text-slate-800">{data.code}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600">Liên kết PO</div>
            <div className="font-semibold text-indigo-600">{data.poCode}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600">Nhà cung cấp</div>
            <div className="font-medium text-slate-800">{data.supplierName}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600">GRN liên kết</div>
            <div className="font-mono text-sm text-slate-700">{data.grnCodes.join(', ')}</div>
          </div>
        </div>

        {/* Dates Info */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50 rounded border border-blue-200">
          <div>
            <div className="text-xs text-blue-600 font-semibold">Ngày xuất hóa đơn</div>
            <div className="font-medium text-slate-800">{data.invoiceDate}</div>
          </div>
          <div>
            <div className="text-xs text-blue-600 font-semibold">Hạn thanh toán</div>
            <div className="font-medium text-slate-800">{data.dueDate}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-blue-600 font-semibold">Điều khoản thanh toán</div>
            <div className="font-medium text-slate-800">{data.paymentTerms}</div>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Chi tiết hàng hóa ({data.items.length} dòng)</h4>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="px-2 py-2 text-left font-semibold">#</th>
                  <th className="px-2 py-2 text-left font-semibold">Tên sản phẩm</th>
                  <th className="px-2 py-2 text-center font-semibold">SL</th>
                  <th className="px-2 py-2 text-left font-semibold">Đơn vị</th>
                  <th className="px-2 py-2 text-right font-semibold">Đơn giá</th>
                  <th className="px-2 py-2 text-right font-semibold">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="px-2 py-2 text-slate-600">{idx + 1}</td>
                    <td className="px-2 py-2 font-medium text-slate-800">{item.productName}</td>
                    <td className="px-2 py-2 text-center">{item.quantity}</td>
                    <td className="px-2 py-2 text-slate-600">{item.unit}</td>
                    <td className="px-2 py-2 text-right text-slate-600">
                      {item.unitPrice.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-2 py-2 text-right font-semibold text-slate-800">
                      {item.totalAmount.toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2 p-3 bg-slate-50 rounded border">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tạm tính</span>
            <span className="font-medium">{data.subtotal.toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Thuế VAT</span>
            <span className="font-medium">{data.vat.toLocaleString('vi-VN')} ₫</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Chiết khấu</span>
              <span className="font-medium text-green-700">- {data.discount.toLocaleString('vi-VN')} ₫</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between">
            <span className="font-semibold text-slate-800">Tổng cộng</span>
            <span className="font-bold text-lg text-indigo-600">{data.total.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>

        {/* Status */}
        <div className={`p-3 rounded border font-semibold text-sm ${STATUS_COLOR[data.status]}`}>
          {STATUS_LABEL[data.status]}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>
        <Button>In hóa đơn</Button>
      </div>
    </Modal>
  )
}
