import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, Plus, X } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'
import { IPurchaseOrder, IPurchaseOrderItem } from '../types'

export function POForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const purchaseOrder = id ? useProcurementStore((state) => state.getPurchaseOrder(id)) : null
  const { addPurchaseOrder, updatePurchaseOrder, suppliers } = useProcurementStore()

  const currentUser = 'Trọng Nguyễn'
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState<Partial<IPurchaseOrder>>({
    code: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(3, '0')}`,
    supplierId: '',
    status: 'Draft',
    items: [],
    createdAt: new Date().toISOString(),
    createdBy: currentUser,
  })

  const [items, setItems] = useState<IPurchaseOrderItem[]>([])
  const [newItem, setNewItem] = useState<Partial<IPurchaseOrderItem>>({
    productName: '',
    quantity: 0,
    unitPrice: 0,
  })

  useEffect(() => {
    if (purchaseOrder) {
      setFormData(purchaseOrder)
      setItems(purchaseOrder.items)
    }
  }, [purchaseOrder])

  const calculateTotal = () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const total = calculateTotal()

  const validateForm = () => {
    return formData.supplierId && items.length > 0 && items.every((item) => item.quantity > 0 && item.unitPrice > 0)
  }

  const handleAddItem = () => {
    if (newItem.productName && newItem.quantity && newItem.unitPrice) {
      const item: IPurchaseOrderItem = {
        id: `item-${Date.now()}`,
        productName: newItem.productName || '',
        quantity: newItem.quantity || 0,
        unitPrice: newItem.unitPrice || 0,
        quantityReceived: 0,
      }
      setItems([...items, item])
      setNewItem({ productName: '', quantity: 0, unitPrice: 0 })
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const dataToSave: IPurchaseOrder = {
      ...formData,
      items,
    } as IPurchaseOrder

    if (id && purchaseOrder) {
      updatePurchaseOrder(id, dataToSave)
    } else {
      dataToSave.id = `po-${Date.now()}`
      addPurchaseOrder(dataToSave)
    }

    navigate('/orders')
  }

  const selectedSupplier = formData.supplierId
    ? suppliers.find((s) => s.id === formData.supplierId)
    : null
  const isFormValid = validateForm()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft size={20} />
            Danh sách PO
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
              Tạo Đơn Đặt Hàng
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">● Draft</span>
            </h1>
            <p className="text-gray-600 text-sm mt-1">{formData.code} · {currentUser} · {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            💾 Lưu nháp
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isFormValid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Tạo PO
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Thông tin đơn hàng */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              Thông tin đơn hàng
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhà cung cấp <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.supplierId || ''}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} ({supplier.code})
                    </option>
                  ))}
                </select>
              </div>

              {selectedSupplier && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-600">Điều khoản thanh toán</div>
                    <div className="font-medium text-gray-900">{selectedSupplier.paymentTerms}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Lead time</div>
                    <div className="font-medium text-gray-900">{selectedSupplier.leadTime} ngày</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Chi tiết mặt hàng */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-600"></span>
                Chi tiết mặt hàng
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{items.length} dòng</span>
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-8">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Tên hàng *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-24">SL *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-32">Đơn giá *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-32">Thành tiền</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                          item.quantity * item.unitPrice
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-600 hover:text-red-700 font-bold">
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Item */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-3">
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={newItem.productName || ''}
                    onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                    placeholder="Tên sản phẩm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    value={newItem.quantity || 0}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                    placeholder="SL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    value={newItem.unitPrice || 0}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseInt(e.target.value) })}
                    placeholder="Đơn giá"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus size={18} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-6 bg-white border-t border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Tạm tính</div>
                <div className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Số dòng hàng</div>
                <div className="text-3xl font-bold text-blue-600">{items.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Summary */}
        <div className="space-y-6">
          {/* Supplier Info */}
          {selectedSupplier && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Thông tin NCC</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">Tên NCC</div>
                  <div className="font-medium text-gray-900">{selectedSupplier.name}</div>
                </div>
                <div>
                  <div className="text-gray-600">Rating</div>
                  <div className="font-medium text-gray-900">{selectedSupplier.rating.toFixed(1)} ★</div>
                </div>
                <div>
                  <div className="text-gray-600">Trạng thái</div>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    selectedSupplier.status === 'Active' ? 'bg-green-100 text-green-700' :
                    selectedSupplier.status === 'Suspended' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedSupplier.status}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">Tổng cộng</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-700">Tạm tính</span>
                <span className="font-semibold text-blue-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">VAT (10%)</span>
                <span className="font-semibold text-blue-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total * 0.1)}
                </span>
              </div>
              <div className="border-t-2 border-blue-200 pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-blue-900">Tổng cộng</span>
                <span className="text-xl font-bold text-blue-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total * 1.1)}
                </span>
              </div>
            </div>
          </div>

          {/* Validation */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Yêu cầu trước khi tạo</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={formData.supplierId ? 'text-green-600' : 'text-gray-400'}>
                  {formData.supplierId ? '✓' : '○'}
                </span>
                <span className={formData.supplierId ? 'text-gray-900 font-medium' : 'text-gray-500'}>Chọn nhà cung cấp</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={items.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                  {items.length > 0 ? '✓' : '○'}
                </span>
                <span className={items.length > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}>Thêm ít nhất 1 mặt hàng</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={items.every((i) => i.quantity > 0 && i.unitPrice > 0) ? 'text-green-600' : 'text-gray-400'}>
                  {items.every((i) => i.quantity > 0 && i.unitPrice > 0) ? '✓' : '○'}
                </span>
                <span className={items.every((i) => i.quantity > 0 && i.unitPrice > 0) ? 'text-gray-900 font-medium' : 'text-gray-500'}>Tất cả mặt hàng có SL & giá</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
