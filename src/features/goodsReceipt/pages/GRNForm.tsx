import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, Save, AlertCircle, CheckCircle2, Calendar } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'

export function GRNForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id

  const [poId, setPoId] = useState('')
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0])
  const [itemQCStatus, setItemQCStatus] = useState<Record<string, 'Pass' | 'Fail' | 'Pending'>>({})
  const [itemBatchNo, setItemBatchNo] = useState<Record<string, string>>({})
  const [itemExpiryDate, setItemExpiryDate] = useState<Record<string, string>>({})
  const [itemStorageLocation, setItemStorageLocation] = useState<Record<string, string>>({})
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({})
  const [receivedQty, setReceivedQty] = useState<Record<string, number>>({})

  const goodsReceipt = useProcurementStore((state) => state.getGoodsReceipt(id || ''))
  const { purchaseOrders, getSupplier, addGoodsReceipt, updateGoodsReceipt } = useProcurementStore()

  const selectedPO = poId ? purchaseOrders.find((po) => po.id === poId) : null
  const selectedGRN = isEditing ? goodsReceipt : null
  const supplier = selectedPO ? getSupplier(selectedPO.supplierId) : null

  const poList = purchaseOrders.filter((po) => ['Confirmed', 'Receiving', 'Completed'].includes(po.status))

  const formItems = selectedPO?.items || []
  const totalReceived = Object.values(receivedQty).reduce((sum, qty) => sum + (qty || 0), 0)
  const itemsWithQC = formItems.filter((item) => itemQCStatus[item.id])
  const allItemsHaveQC = itemsWithQC.length === formItems.length

  const validationStatus = {
    poSelected: !!poId,
    itemsReceived: totalReceived > 0,
    allQCStatus: allItemsHaveQC,
  }

  const isValid = validationStatus.poSelected && validationStatus.itemsReceived && validationStatus.allQCStatus

  const handleSave = () => {
    if (!isValid || !selectedPO) return

    const grnItems = formItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      expectedQty: item.quantity,
      receivedQty: receivedQty[item.id] || 0,
      unit: item.unit,
      qcStatus: (itemQCStatus[item.id] || 'Pending') as 'Pass' | 'Fail' | 'Pending',
      batchNo: itemBatchNo[item.id],
      expiryDate: itemExpiryDate[item.id] ? new Date(itemExpiryDate[item.id]) : undefined,
      storageLocation: itemStorageLocation[item.id],
      notes: itemNotes[item.id],
    }))

    const grnData = {
      id: selectedGRN?.id || `GRN-${Date.now()}`,
      code: selectedGRN?.code || `GRN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
      poId,
      supplierId: selectedPO.supplierId,
      supplierName: supplier?.name || '',
      status: 'Draft' as const,
      isPartial: grnItems.some((item) => item.receivedQty < item.expectedQty),
      items: grnItems,
      receivedDate: new Date(receivedDate),
      createdAt: selectedGRN?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    if (isEditing && selectedGRN) {
      updateGoodsReceipt(selectedGRN.id, grnData)
    } else {
      addGoodsReceipt(grnData)
    }

    navigate('/goods-receipts')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Chỉnh Sửa Phiếu Nhập Hàng' : 'Tạo Phiếu Nhập Hàng'}
              </h1>
              <p className="text-gray-600 text-sm mt-1">Nhập hàng từ đơn đặt hàng</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
              isValid
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save size={18} />
            {isEditing ? 'Lưu' : 'Tạo GRN'}
          </button>
        </div>

        {/* Validation Bar */}
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              {validationStatus.poSelected ? (
                <CheckCircle2 size={18} className="text-green-600" />
              ) : (
                <AlertCircle size={18} className="text-red-600" />
              )}
              <span className="text-sm">Chọn đơn đặt hàng</span>
            </div>
            <div className="flex items-center gap-2">
              {validationStatus.itemsReceived ? (
                <CheckCircle2 size={18} className="text-green-600" />
              ) : (
                <AlertCircle size={18} className="text-red-600" />
              )}
              <span className="text-sm">Nhập ít nhất 1 mặt hàng</span>
            </div>
            <div className="flex items-center gap-2">
              {validationStatus.allQCStatus ? (
                <CheckCircle2 size={18} className="text-green-600" />
              ) : (
                <AlertCircle size={18} className="text-red-600" />
              )}
              <span className="text-sm">Tất cả mặt hàng có trạng thái QC</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Thông Tin Chung */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông Tin Chung</h2>
              <div className="space-y-4">
                {/* PO Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đơn Đặt Hàng *</label>
                  <select
                    value={poId}
                    onChange={(e) => {
                      setPoId(e.target.value)
                      setReceivedQty({})
                      setItemQCStatus({})
                      setItemBatchNo({})
                      setItemExpiryDate({})
                      setItemStorageLocation({})
                      setItemNotes({})
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn đơn đặt hàng --</option>
                    {poList.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.code} - {po.supplierName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supplier Info */}
                {supplier && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Nhà Cung Cấp</div>
                        <div className="font-medium text-gray-900">{supplier.name}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Mã Số Thuế</div>
                        <div className="font-medium text-gray-900">{supplier.taxCode}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Địa Chỉ</div>
                        <div className="font-medium text-gray-900">{supplier.address}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Liên Hệ</div>
                        <div className="font-medium text-gray-900">{supplier.contactPerson}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Received Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày Nhập Hàng *</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      value={receivedDate}
                      onChange={(e) => setReceivedDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Danh Sách Mặt Hàng */}
            {selectedPO && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Danh Sách Mặt Hàng ({formItems.length})
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Mặt Hàng</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Dự Kiến</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Nhập</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Còn Lại</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">QC</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Lô Hàng</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Hạn Sử Dụng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formItems.map((item) => {
                        const received = receivedQty[item.id] || 0
                        const outstanding = item.quantity - received
                        return (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
                            <td className="px-4 py-3 text-right text-gray-600">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                max={item.quantity}
                                value={received}
                                onChange={(e) =>
                                  setReceivedQty((prev) => ({
                                    ...prev,
                                    [item.id]: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-right text-orange-600 font-medium">
                              {outstanding} {item.unit}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={itemQCStatus[item.id] || ''}
                                onChange={(e) =>
                                  setItemQCStatus((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value as 'Pass' | 'Fail' | 'Pending',
                                  }))
                                }
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">--</option>
                                <option value="Pass">Pass</option>
                                <option value="Fail">Fail</option>
                                <option value="Pending">Pending</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                placeholder="Lô hàng"
                                value={itemBatchNo[item.id] || ''}
                                onChange={(e) =>
                                  setItemBatchNo((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="date"
                                value={itemExpiryDate[item.id] || ''}
                                onChange={(e) =>
                                  setItemExpiryDate((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Item Notes */}
                <div className="mt-6 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Ghi Chú Cho Mặt Hàng</label>
                  {formItems.map((item) => (
                    <div key={item.id}>
                      <label className="block text-xs text-gray-600 mb-1">{item.productName}</label>
                      <textarea
                        placeholder="Ghi chú cho mặt hàng này"
                        value={itemNotes[item.id] || ''}
                        onChange={(e) =>
                          setItemNotes((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary & Validation */}
          <div className="space-y-6">
            {/* PO Summary */}
            {selectedPO && (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông Tin Đơn Hàng</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-600">Mã PO</div>
                    <div className="font-medium text-gray-900">{selectedPO.code}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Nhà Cung Cấp</div>
                    <div className="font-medium text-gray-900">{selectedPO.supplierName}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tổng Tiền</div>
                    <div className="font-medium text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                        selectedPO.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Trạng Thái</div>
                    <div className="font-medium text-gray-900">{selectedPO.status}</div>
                  </div>
                </div>
              </div>
            )}

            {/* GRN Summary */}
            {selectedPO && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tóm Tắt Nhập Hàng</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-600">Tổng Dự Kiến</div>
                    <div className="font-medium text-lg text-blue-900">
                      {formItems.reduce((sum, item) => sum + item.quantity, 0)} {formItems[0]?.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Đã Nhập</div>
                    <div className="font-medium text-lg text-green-600">{totalReceived}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Còn Lại</div>
                    <div className="font-medium text-lg text-orange-600">
                      {formItems.reduce((sum, item) => sum + item.quantity, 0) - totalReceived}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Checklist */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Danh Sách Kiểm Tra</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  {validationStatus.poSelected ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                  )}
                  <span className="text-gray-700">Đơn đặt hàng được chọn</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  {validationStatus.itemsReceived ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                  )}
                  <span className="text-gray-700">Nhập ít nhất 1 mặt hàng</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  {validationStatus.allQCStatus ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                  )}
                  <span className="text-gray-700">Tất cả mặt hàng có QC</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
