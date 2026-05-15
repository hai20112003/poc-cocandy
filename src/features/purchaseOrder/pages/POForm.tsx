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

  const [formData, setFormData] = useState<Partial<IPurchaseOrder>>({
    code: '',
    supplierId: '',
    status: 'Draft',
    items: [],
    createdAt: new Date().toISOString(),
    createdBy: 'Current User',
  })

  const [items, setItems] = useState<IPurchaseOrderItem[]>([])
  const [newItem, setNewItem] = useState<Partial<IPurchaseOrderItem>>({
    productName: '',
    quantity: 0,
    unitPrice: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (purchaseOrder) {
      setFormData(purchaseOrder)
      setItems(purchaseOrder.items)
    }
  }, [purchaseOrder])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.code) newErrors.code = 'PO code is required'
    if (!formData.supplierId) newErrors.supplierId = 'Supplier is required'
    if (items.length === 0) newErrors.items = 'At least one item is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      setNewItem({
        productName: '',
        quantity: 0,
        unitPrice: 0,
      })
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
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

    navigate(id ? `/orders/${id}` : '/orders')
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
          <h1 className="text-3xl font-bold text-gray-900">{id ? 'Edit Purchase Order' : 'Create Purchase Order'}</h1>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Code *</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={!!id}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="PO-001"
                />
                {errors.code && <p className="text-red-600 text-sm mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                <select
                  value={formData.supplierId || ''}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.supplierId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {errors.supplierId && <p className="text-red-600 text-sm mt-1">{errors.supplierId}</p>}
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
                      <th className="text-right py-2 font-medium text-gray-700">Quantity</th>
                      <th className="text-right py-2 font-medium text-gray-700">Unit Price</th>
                      <th className="text-right py-2 font-medium text-gray-700">Amount</th>
                      <th className="text-center py-2 font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2">{item.productName}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}
                        </td>
                        <td className="py-2 text-right">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            item.quantity * item.unitPrice
                          )}
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

              <div className="grid grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.unitPrice || 0}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      (newItem.quantity || 0) * (newItem.unitPrice || 0)
                    )}
                  </div>
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
              <div className="text-sm text-gray-600">Total Amount</div>
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
              {id ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
