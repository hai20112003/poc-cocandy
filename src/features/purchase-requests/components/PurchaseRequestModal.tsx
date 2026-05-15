import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { PurchaseRequest, PurchaseRequestItem } from '../types'

interface PurchaseRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Omit<PurchaseRequest, 'id' | 'createdAt'>) => void
  data?: PurchaseRequest
}

export function PurchaseRequestModal({ open, onOpenChange, onSave, data }: PurchaseRequestModalProps) {
  const [formData, setFormData] = useState({
    department: data?.department ?? '',
    neededDate: data?.neededDate ?? '',
    priority: data?.priority ?? 'medium',
    items: data?.items ?? [
      {
        id: '1',
        productName: '',
        specification: '',
        quantity: 0,
        unit: 'mét',
        estimatedPrice: 0,
        suggestedSupplier: '',
      },
    ],
    notes: data?.notes ?? '',
  })

  const PRODUCTS = [
    { name: 'Vải Cotton Trắng', unit: 'mét' },
    { name: 'Vải Cotton Xanh Navy', unit: 'mét' },
    { name: 'Vải Cotton Đỏ Đô', unit: 'mét' },
    { name: 'Vải Lụa Kem', unit: 'mét' },
    { name: 'Khóa Kéo 20cm', unit: 'cái' },
    { name: 'Nút Áo 4 Lỗ', unit: 'cái' },
    { name: 'Chỉ May Lụa', unit: 'cuộn' },
    { name: 'Mex Lót Mỏng', unit: 'mét' },
    { name: 'Túi Nilon 10x20', unit: 'cái' },
  ]

  const SUPPLIERS = [
    'Vải ABC Trading',
    'Phụ Liệu XYZ',
    'Vải Lụa Hạnh Phúc',
    'NCC Nút Bấm 123',
    'Cotton Premium',
  ]

  function handleAddItem() {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Math.random().toString(),
          productName: '',
          specification: '',
          quantity: 0,
          unit: 'mét',
          estimatedPrice: 0,
          suggestedSupplier: '',
        },
      ],
    }))
  }

  function handleRemoveItem(itemId: string) {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
  }

  function handleItemChange(itemId: string, field: keyof PurchaseRequestItem, value: any) {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    }))
  }

  function handleProductChange(itemId: string, productName: string) {
    const product = PRODUCTS.find((p) => p.name === productName)
    handleItemChange(itemId, 'productName', productName)
    if (product) {
      handleItemChange(itemId, 'unit', product.unit)
    }
  }

  const totalEstimated = formData.items.reduce((sum, item) => sum + item.quantity * item.estimatedPrice, 0)

  function handleSubmit() {
    if (!formData.department || !formData.neededDate || formData.items.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    onSave({
      code: data?.code ?? `PR-${Date.now()}`,
      ...formData,
      totalEstimated,
      status: data?.status ?? 'draft',
      createdBy: data?.createdBy ?? 'Current User',
    })

    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={data ? 'Chỉnh sửa yêu cầu mua hàng' : 'Tạo yêu cầu mua hàng'}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Department & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bộ phận yêu cầu *</label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
            >
              <option value="">-- Chọn bộ phận --</option>
              <option value="Sản xuất">Sản xuất</option>
              <option value="Kiểm chất lượng">Kiểm chất lượng</option>
              <option value="Kho">Kho</option>
              <option value="Bán hàng">Bán hàng</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày cần hàng *</label>
            <Input
              type="date"
              value={formData.neededDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, neededDate: e.target.value }))}
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium mb-2">Mức độ ưu tiên *</label>
          <div className="flex gap-3">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <Button
                key={p}
                variant={formData.priority === p ? 'default' : 'outline'}
                onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                className="flex-1"
              >
                {p === 'low' ? 'Thấp' : p === 'medium' ? 'Bình thường' : 'Cao'}
              </Button>
            ))}
          </div>
        </div>

        {/* Items Table */}
        <div>
          <label className="block text-sm font-medium mb-2">Chi tiết sản phẩm *</label>
          <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
            {formData.items.map((item, idx) => (
              <div key={item.id} className="space-y-2 pb-3 border-b last:border-b-0 last:pb-0">
                <div className="text-xs font-semibold text-slate-600">Dòng {idx + 1}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs">Sản phẩm</label>
                    <Select value={item.productName} onValueChange={(val) => handleProductChange(item.id, val)}>
                      <option value="">-- Chọn --</option>
                      {PRODUCTS.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs">Đặc tả</label>
                    <Input
                      placeholder="Màu, khổ..."
                      value={item.specification}
                      onChange={(e) => handleItemChange(item.id, 'specification', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs">Số lượng</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs">Đơn vị</label>
                    <Input value={item.unit} readOnly className="bg-slate-100" />
                  </div>
                  <div>
                    <label className="text-xs">Giá ước tính (VND)</label>
                    <Input
                      type="number"
                      min="0"
                      value={item.estimatedPrice}
                      onChange={(e) => handleItemChange(item.id, 'estimatedPrice', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs">NCC gợi ý</label>
                    <Select value={item.suggestedSupplier ?? ''} onValueChange={(val) => handleItemChange(item.id, 'suggestedSupplier', val)}>
                      <option value="">-- Không --</option>
                      {SUPPLIERS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={handleAddItem} className="w-full mt-2">
              <Plus className="w-4 h-4 mr-1" /> Thêm dòng hàng
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-50 p-3 rounded border">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Tổng giá trị ước tính:</span>
            <span className="font-semibold">{totalEstimated.toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 mt-1">
            <span>Số dòng hàng:</span>
            <span>{formData.items.length} dòng</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Ghi chú</label>
          <textarea
            className="w-full px-3 py-2 border rounded text-sm"
            rows={3}
            placeholder="Thêm ghi chú..."
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Hủy
        </Button>
        <Button onClick={handleSubmit}>
          {data ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </Modal>
  )
}
