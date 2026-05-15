import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, Plus, X, AlertCircle } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'
import { IPurchaseRequest, IPurchaseRequestItem } from '../types'

const PRODUCTS = [
  'Vải Cotton Trắng',
  'Vải Cotton Xanh Navy',
  'Vải Cotton Đỏ Đô',
  'Vải Lụa Kem',
  'Khóa Kéo 20cm',
  'Nút Áo 4 Lỗ',
  'Chỉ May Lụa',
  'Mex Lót Mỏng',
  'Túi Nilon 10x20',
]

const SUPPLIERS = ['Vải ABC Trading', 'Phụ Liệu XYZ', 'Vải Lụa Hạnh Phúc', 'NCC Nút Bấm 123', 'Cotton Premium']

const DEPARTMENTS = ['Kho', 'Sản xuất', 'Kinh doanh']

export function PRForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const purchaseRequest = id ? useProcurementStore((state) => state.getPurchaseRequest(id)) : null
  const { addPurchaseRequest, updatePurchaseRequest } = useProcurementStore()

  const currentUser = 'Trọng Nguyễn'
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState<Partial<IPurchaseRequest>>({
    code: `PR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(3, '0')}`,
    department: '',
    createdBy: currentUser,
    neededDate: new Date(today),
    priority: 'Low' as const,
    status: 'Draft',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    approver: '',
  })

  const [items, setItems] = useState<IPurchaseRequestItem[]>([])
  const [newItem, setNewItem] = useState<Partial<IPurchaseRequestItem>>({
    productName: '',
    specification: '',
    quantity: 0,
    unit: '',
    estimatedPrice: 0,
  })

  useEffect(() => {
    if (purchaseRequest) {
      setFormData(purchaseRequest)
      setItems(purchaseRequest.items)
    }
  }, [purchaseRequest])

  const calculateTotal = () => items.reduce((sum, item) => sum + (item.quantity * item.estimatedPrice), 0)
  const total = calculateTotal()

  const getApprovalLevel = () => {
    if (total < 5000000) return 'Quản lý Kho / Bộ phận'
    if (total <= 50000000) return 'Trưởng phòng'
    return 'Giám đốc'
  }

  const validateForm = () => {
    return formData.department && formData.neededDate && formData.priority && items.length > 0 && items.every(item => item.quantity > 0)
  }

  const handleAddItem = () => {
    if (newItem.productName && newItem.quantity && newItem.unit) {
      const item: IPurchaseRequestItem = {
        id: `item-${Date.now()}`,
        productName: newItem.productName || '',
        specification: newItem.specification || '',
        quantity: newItem.quantity || 0,
        unit: newItem.unit || '',
        estimatedPrice: newItem.estimatedPrice || 0,
        suggestedSupplier: newItem.suggestedSupplier,
      }
      setItems([...items, item])
      setNewItem({ productName: '', specification: '', quantity: 0, unit: '', estimatedPrice: 0 })
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const totalAmount = calculateTotal()
    const dataToSave: IPurchaseRequest = {
      ...formData,
      items,
      subtotal: totalAmount,
      tax: 0,
      total: totalAmount,
      updatedAt: new Date(),
    } as IPurchaseRequest

    if (id && purchaseRequest) {
      updatePurchaseRequest(id, dataToSave)
    } else {
      dataToSave.id = `pr-${Date.now()}`
      addPurchaseRequest(dataToSave)
    }

    navigate('/purchase-requests')
  }

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
            Danh sách PR
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
              Tạo Yêu Cầu Mua Hàng
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">◌ Draft</span>
            </h1>
            <p className="text-gray-600 text-sm mt-1">{formData.code} · Tự động sinh · {currentUser} · {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isFormValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Submit duyệt
          </button>
        </div>
      </div>

      {/* Validation Bar */}
      <div className={`mb-6 p-4 rounded-lg flex items-start gap-4 ${!isFormValid ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
        <AlertCircle size={20} className={!isFormValid ? 'text-amber-600' : 'text-green-600'} />
        <div className="flex-1">
          <div className="flex flex-wrap gap-4">
            <span className={!formData.department ? 'text-amber-600' : 'text-green-600'}>
              {!formData.department ? '✗ Chưa chọn bộ phận' : '✓ Bộ phận'}
            </span>
            <span className={!formData.neededDate ? 'text-amber-600' : 'text-green-600'}>
              {!formData.neededDate ? '✗ Chưa chọn ngày cần hàng' : '✓ Ngày cần hàng'}
            </span>
            <span className={!formData.priority ? 'text-amber-600' : 'text-green-600'}>
              {!formData.priority ? '✗ Chưa chọn ưu tiên' : '✓ Ưu tiên'}
            </span>
            <span className={items.length === 0 ? 'text-amber-600' : 'text-green-600'}>
              {items.length === 0 ? '✗ Chưa có dòng hàng' : '✓ Có dòng hàng'}
            </span>
          </div>
        </div>
        <span className="text-sm text-amber-600 whitespace-nowrap">Điền đủ để submit</span>
      </div>

      {/* Form Layout - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Thông tin chung */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              Thông tin chung
            </h2>

            <div className="space-y-4">
              {/* Department & Created By */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bộ phận yêu cầu <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn bộ phận --</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Bộ phận chịu trách nhiệm yêu cầu này</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người tạo</label>
                  <input
                    type="text"
                    value={currentUser}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tự lấy từ tài khoản đang đăng nhập</p>
                </div>
              </div>

              {/* Needed Date & Created Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày cần có hàng <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.neededDate || today}
                    onChange={(e) => setFormData({ ...formData, neededDate: e.target.value })}
                    min={today}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Phải sau hôm nay — dùng để tính deadline gửi PO cho NCC</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                  <input
                    type="text"
                    value={new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ ưu tiên <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'low', label: '● Low' },
                    { value: 'medium', label: '● Medium' },
                    { value: 'high', label: '● High' },
                    { value: 'urgent', label: '🔴 Urgent' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: option.value as any })}
                      className={`flex-1 py-2 rounded-lg border-2 font-medium transition ${
                        formData.priority === option.value
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Urgent — cần duyệt trong ngày. High — trong 24h.</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Lý do mua, yêu cầu đặc biệt, ghi chú cho người duyệt..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Danh sách hàng */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-600"></span>
                Danh sách hàng cần mua
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{items.length} dòng</span>
              </h2>
              <span className="text-xs text-gray-500">Ít nhất 1 dòng hàng</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-8">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Sản phẩm *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Đặc tả</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-20">SL *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-20">Đơn vị *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-32">Giá ước tính</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">NCC gợi ý</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.specification}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.unit}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.estimatedPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600">{item.suggestedSupplier || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-600 hover:text-red-700 font-bold"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Item Form */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-3">
              <div className="grid grid-cols-8 gap-2">
                <div className="col-span-2">
                  <select
                    value={newItem.productName || ''}
                    onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {PRODUCTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1.5">
                  <input
                    type="text"
                    value={newItem.specification || ''}
                    onChange={(e) => setNewItem({ ...newItem, specification: e.target.value })}
                    placeholder="Màu, khổ..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    min="0"
                    value={newItem.quantity || 0}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="text"
                    value={newItem.unit || ''}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="mét"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-1.5">
                  <input
                    type="number"
                    min="0"
                    value={newItem.estimatedPrice || 0}
                    onChange={(e) => setNewItem({ ...newItem, estimatedPrice: parseInt(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-1">
                  <select
                    value={newItem.suggestedSupplier || ''}
                    onChange={(e) => setNewItem({ ...newItem, suggestedSupplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Không --</option>
                    {SUPPLIERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Thêm dòng hàng
              </button>
            </div>

            {/* Summary */}
            <div className="p-6 bg-white border-t border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Tổng giá trị ước tính</div>
                <div className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Dựa trên giá ước tính đã nhập · Chưa chính thức</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Số dòng hàng</div>
                <div className="text-3xl font-bold text-blue-600">{items.length}</div>
                <div className="text-xs text-gray-500">dòng</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Preview & Rules */}
        <div className="space-y-6">
          {/* Approval Routing */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-600"></span>
              Dự kiến luồng duyệt
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Tổng ước tính</div>
              <div className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <div className="text-sm font-semibold text-blue-900">Cấp duyệt dự kiến</div>
              <div className="text-lg font-bold text-blue-600 mt-2">{getApprovalLevel()}</div>
            </div>
          </div>

          {/* Approval Rules */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Quy tắc cấp duyệt</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Dưới 5 triệu</span>
                <span className="text-green-600 font-semibold">Quản lý Kho / Bộ phận</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">5 – 50 triệu</span>
                <span className="text-amber-600 font-semibold">Trưởng phòng</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trên 50 triệu</span>
                <span className="text-red-600 font-semibold">Giám đốc</span>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-600"></span>
              Checklist trước khi submit
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={formData.department ? 'text-green-600' : 'text-gray-400'}>
                  {formData.department ? '✓' : '○'}
                </span>
                <span className={formData.department ? 'text-gray-900 font-medium' : 'text-gray-500'}>Chọn bộ phận yêu cầu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={formData.neededDate ? 'text-green-600' : 'text-gray-400'}>
                  {formData.neededDate ? '✓' : '○'}
                </span>
                <span className={formData.neededDate ? 'text-gray-900 font-medium' : 'text-gray-500'}>Điền ngày cần có hàng</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={formData.priority ? 'text-green-600' : 'text-gray-400'}>
                  {formData.priority ? '✓' : '○'}
                </span>
                <span className={formData.priority ? 'text-gray-900 font-medium' : 'text-gray-500'}>Chọn mức độ ưu tiên</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={items.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                  {items.length > 0 ? '✓' : '○'}
                </span>
                <span className={items.length > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}>Thêm ít nhất 1 dòng hàng</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={items.every(i => i.quantity > 0) ? 'text-green-600' : 'text-gray-400'}>
                  {items.every(i => i.quantity > 0) ? '✓' : '○'}
                </span>
                <span className={items.every(i => i.quantity > 0) ? 'text-gray-900 font-medium' : 'text-gray-500'}>Tất cả dòng hàng có SL &gt; 0</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-gray-300">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Không cần nhập lúc này</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div>— <strong>Giá chính thức</strong> — xác định khi hỏi NCC / tạo PO</div>
              <div>— <strong>NCC chính thức</strong> — chọn khi tạo PO sau duyệt</div>
              <div>— <strong>Approved by / at</strong> — điền khi người duyệt xác nhận</div>
              <div>— <strong>Mã PO</strong> — tự sinh khi convert sang Purchase Order</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
