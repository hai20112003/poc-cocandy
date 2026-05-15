import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, Plus, X } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'
import { IPurchaseRequest, IPurchaseRequestItem } from '../types'

export function PRForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const purchaseRequest = id ? useProcurementStore((state) => state.getPurchaseRequest(id)) : null
  const { addPurchaseRequest, updatePurchaseRequest } = useProcurementStore()

  const [formData, setFormData] = useState<Partial<IPurchaseRequest>>({
    code: '',
    department: '',
    requester: '',
    neededByDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'Draft',
    items: [],
    totalEstimated: 0,
    createdAt: new Date().toISOString(),
    createdBy: 'Current User',
    notes: '',
  })

  const [items, setItems] = useState<IPurchaseRequestItem[]>([])
  const [newItem, setNewItem] = useState<Partial<IPurchaseRequestItem>>({
    productName: '',
    specification: '',
    quantity: 0,
    unit: '',
    estimatedPrice: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (purchaseRequest) {
      setFormData(purchaseRequest)
      setItems(purchaseRequest.items)
    }
  }, [purchaseRequest])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.code) newErrors.code = 'PR code is required'
    if (!formData.department) newErrors.department = 'Department is required'
    if (!formData.requester) newErrors.requester = 'Requester is required'
    if (items.length === 0) newErrors.items = 'At least one item is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddItem = () => {
    if (newItem.productName && newItem.quantity && newItem.unit && newItem.estimatedPrice) {
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
      setNewItem({
        productName: '',
        specification: '',
        quantity: 0,
        unit: '',
        estimatedPrice: 0,
      })
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.estimatedPrice), 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const dataToSave: IPurchaseRequest = {
      ...formData,
      items,
      totalEstimated: calculateTotal(),
    } as IPurchaseRequest

    if (id && purchaseRequest) {
      updatePurchaseRequest(id, dataToSave)
    } else {
      dataToSave.id = `pr-${Date.now()}`
      addPurchaseRequest(dataToSave)
    }

    navigate(id ? `/purchase-requests/${id}` : '/purchase-requests')
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
          <h1 className="text-3xl font-bold text-gray-900">{id ? 'Edit Purchase Request' : 'Create Purchase Request'}</h1>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">PR Code *</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={!!id}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="PR-001"
                />
                {errors.code && <p className="text-red-600 text-sm mt-1">{errors.code}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Engineering"
                  />
                  {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requester *</label>
                  <input
                    type="text"
                    value={formData.requester || ''}
                    onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.requester ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Employee name"
                  />
                  {errors.requester && <p className="text-red-600 text-sm mt-1">{errors.requester}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Needed By Date</label>
                  <input
                    type="date"
                    value={formData.neededByDate || ''}
                    onChange={(e) => setFormData({ ...formData, neededByDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or special instructions"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items *</h2>
            {errors.items && <p className="text-red-600 text-sm mb-4">{errors.items}</p>}

            <div className="space-y-3 mb-6 overflow-x-auto">
              {items.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-700">Product</th>
                      <th className="text-right py-2 font-medium text-gray-700">Qty</th>
                      <th className="text-left py-2 font-medium text-gray-700">Unit</th>
                      <th className="text-right py-2 font-medium text-gray-700">Est. Price</th>
                      <th className="text-center py-2 font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2">{item.productName}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2">{item.unit}</td>
                        <td className="py-2 text-right">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.estimatedPrice)}
                        </td>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specification</label>
                <input
                  type="text"
                  value={newItem.specification || ''}
                  onChange={(e) => setNewItem({ ...newItem, specification: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Technical specs"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.quantity || 0}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newItem.unit || ''}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="pcs, kg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Est. Price</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.estimatedPrice || 0}
                    onChange={(e) => setNewItem({ ...newItem, estimatedPrice: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={newItem.suggestedSupplier || ''}
                    onChange={(e) => setNewItem({ ...newItem, suggestedSupplier: e.target.value })}
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

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Estimated Amount</div>
              <div className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
              </div>
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
              {id ? 'Update Request' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
