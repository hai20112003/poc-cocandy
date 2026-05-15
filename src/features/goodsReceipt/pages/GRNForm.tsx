import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, Plus, X } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'
import { IGRN, IGRNItem } from '../types'

export function GRNForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goodsReceipt = id ? useProcurementStore((state) => state.getGoodsReceipt(id)) : null
  const { addGoodsReceipt, updateGoodsReceipt, purchaseOrders } = useProcurementStore()

  const [formData, setFormData] = useState<Partial<IGRN>>({
    code: '',
    poId: '',
    status: 'Draft',
    receivedDate: new Date().toISOString().split('T')[0],
    receivedBy: 'Current User',
    qcStatus: 'Pending',
    items: [],
    returns: [],
    warehouseLocation: '',
    notes: '',
    createdAt: new Date().toISOString(),
  })

  const [items, setItems] = useState<IGRNItem[]>([])
  const [newItem, setNewItem] = useState<Partial<IGRNItem>>({
    productName: '',
    quantityReceived: 0,
    qcStatus: 'Pending',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (goodsReceipt) {
      setFormData(goodsReceipt)
      setItems(goodsReceipt.items)
    }
  }, [goodsReceipt])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.code) newErrors.code = 'GRN code is required'
    if (!formData.poId) newErrors.poId = 'Purchase Order is required'
    if (items.length === 0) newErrors.items = 'At least one item is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddItem = () => {
    if (newItem.productName && newItem.quantityReceived !== undefined) {
      const item: IGRNItem = {
        id: `item-${Date.now()}`,
        productName: newItem.productName || '',
        quantityReceived: newItem.quantityReceived || 0,
        qcStatus: newItem.qcStatus || 'Pending',
        notes: newItem.notes,
      }
      setItems([...items, item])
      setNewItem({
        productName: '',
        quantityReceived: 0,
        qcStatus: 'Pending',
      })
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const dataToSave: IGRN = {
      ...formData,
      items,
    } as IGRN

    if (id && goodsReceipt) {
      updateGoodsReceipt(id, dataToSave)
    } else {
      dataToSave.id = `grn-${Date.now()}`
      addGoodsReceipt(dataToSave)
    }

    navigate(id ? `/goods-receipts/${id}` : '/goods-receipts')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{id ? 'Edit Goods Receipt' : 'Create Goods Receipt'}</h1>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GRN Code *</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={!!id}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="GRN-001"
                />
                {errors.code && <p className="text-red-600 text-sm mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order *</label>
                <select
                  value={formData.poId || ''}
                  onChange={(e) => setFormData({ ...formData, poId: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.poId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a purchase order</option>
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.code} - {po.supplierName}
                    </option>
                  ))}
                </select>
                {errors.poId && <p className="text-red-600 text-sm mt-1">{errors.poId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received Date</label>
                  <input
                    type="date"
                    value={formData.receivedDate || ''}
                    onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
                  <input
                    type="text"
                    value={formData.receivedBy || ''}
                    onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Location</label>
                <input
                  type="text"
                  value={formData.warehouseLocation || ''}
                  onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Location code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Received Items *</h2>
            {errors.items && <p className="text-red-600 text-sm mb-4">{errors.items}</p>}

            <div className="space-y-3 mb-6 overflow-x-auto">
              {items.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-700">Product</th>
                      <th className="text-right py-2 font-medium text-gray-700">Quantity</th>
                      <th className="text-center py-2 font-medium text-gray-700">QC Status</th>
                      <th className="text-left py-2 font-medium text-gray-700">Notes</th>
                      <th className="text-center py-2 font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2">{item.productName}</td>
                        <td className="py-2 text-right">{item.quantityReceived}</td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.qcStatus === 'Pass' ? 'bg-green-100 text-green-700' :
                            item.qcStatus === 'Fail' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.qcStatus}
                          </span>
                        </td>
                        <td className="py-2 text-sm text-gray-600">{item.notes || '-'}</td>
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newItem.productName || ''}
                  onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product name"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Received</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.quantityReceived || 0}
                    onChange={(e) => setNewItem({ ...newItem, quantityReceived: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">QC Status</label>
                  <select
                    value={newItem.qcStatus || 'Pending'}
                    onChange={(e) => setNewItem({ ...newItem, qcStatus: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={newItem.notes || ''}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-200 pt-6 flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {id ? 'Update Receipt' : 'Create Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
