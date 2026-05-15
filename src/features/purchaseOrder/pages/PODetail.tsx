import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, Edit, FileText, Truck, Check, Clock, Package, Send } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'
import { usePOWorkflow } from '@/hooks/useWorkflow'

export function PODetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'items' | 'timeline'>('items')
  const purchaseOrder = useProcurementStore((state) => state.getPurchaseOrder(id || ''))
  const { sendPO, confirmPO, startReceiving, completePO } = usePOWorkflow()
  const supplier = purchaseOrder ? useProcurementStore((state) => state.getSupplier(purchaseOrder.supplierId)) : null

  if (!purchaseOrder) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Purchase Order Not Found</h1>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      case 'Sent':
        return 'bg-blue-100 text-blue-800'
      case 'Confirmed':
        return 'bg-purple-100 text-purple-800'
      case 'Receiving':
        return 'bg-orange-100 text-orange-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return <FileText size={20} />
      case 'Sent':
        return <Clock size={20} />
      case 'Confirmed':
        return <Check size={20} />
      case 'Receiving':
        return <Truck size={20} />
      case 'Completed':
        return <Package size={20} />
      default:
        return <Clock size={20} />
    }
  }

  const totalItems = purchaseOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const totalReceived = purchaseOrder.items.reduce((sum, item) => sum + (item.quantityReceived * item.unitPrice), 0)

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
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{purchaseOrder.code}</h1>
            <p className="text-gray-600">Purchase Order</p>
          </div>
        </div>
        <div className="flex gap-2">
          {purchaseOrder.status === 'Draft' && (
            <>
              <button
                onClick={() => navigate(`/orders/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                onClick={() => sendPO(id || '', 'supplier@email.com')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Send size={18} />
                Send to Supplier
              </button>
            </>
          )}
          {purchaseOrder.status === 'Sent' && (
            <button
              onClick={() => confirmPO(id || '', 'Manager')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Check size={18} />
              Confirm
            </button>
          )}
          {purchaseOrder.status === 'Confirmed' && (
            <button
              onClick={() => startReceiving(id || '')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              <Truck size={18} />
              Start Receiving
            </button>
          )}
          {purchaseOrder.status === 'Receiving' && (
            <button
              onClick={() => completePO(id || '')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Check size={18} />
              Complete
            </button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Status</div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchaseOrder.status)}`}>
            {purchaseOrder.status}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Supplier</div>
          <div className="text-lg font-semibold text-gray-900">{supplier?.name || 'Unknown'}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Total Amount</div>
          <div className="text-lg font-semibold text-gray-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalItems)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Received Amount</div>
          <div className="text-lg font-semibold text-gray-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalReceived)}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Supplier</div>
              <div className="text-gray-900">{supplier?.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Created Date</div>
              <div className="text-gray-900">{new Date(purchaseOrder.createdAt).toLocaleDateString('vi-VN')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Created By</div>
              <div className="text-gray-900">{purchaseOrder.createdBy}</div>
            </div>
            {purchaseOrder.relatedPRIds && purchaseOrder.relatedPRIds.length > 0 && (
              <div>
                <div className="text-sm text-gray-600">Related PRs</div>
                <div className="space-y-1">
                  {purchaseOrder.relatedPRIds.map((prId) => (
                    <button
                      key={prId}
                      onClick={() => navigate(`/purchase-requests/${prId}`)}
                      className="text-blue-600 hover:underline block"
                    >
                      View PR
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
          <div className="space-y-3 text-sm">
            {purchaseOrder.sentAt && (
              <div>
                <div className="text-gray-600">Sent Date</div>
                <div className="text-gray-900">{new Date(purchaseOrder.sentAt).toLocaleDateString('vi-VN')}</div>
              </div>
            )}
            {purchaseOrder.confirmedAt && (
              <div>
                <div className="text-gray-600">Confirmed Date</div>
                <div className="text-gray-900">{new Date(purchaseOrder.confirmedAt).toLocaleDateString('vi-VN')}</div>
              </div>
            )}
            {purchaseOrder.completedAt && (
              <div>
                <div className="text-gray-600">Completed Date</div>
                <div className="text-gray-900">{new Date(purchaseOrder.completedAt).toLocaleDateString('vi-VN')}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex border-b border-gray-200">
          {(['items', 'timeline'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'items' ? 'Items' : 'Timeline'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'items' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Qty Ordered</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Qty Received</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Outstanding</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrder.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-900 font-medium">{item.productName}</td>
                      <td className="px-6 py-4 text-right text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-900">{item.quantityReceived}</td>
                      <td className="px-6 py-4 text-right text-orange-600 font-medium">
                        {item.quantity - item.quantityReceived}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                    <FileText size={20} />
                  </div>
                  <div className="w-1 flex-grow bg-gray-200 mt-2" style={{ height: '40px' }}></div>
                </div>
                <div className="pb-8">
                  <div className="font-semibold text-gray-900">Created</div>
                  <div className="text-sm text-gray-600">{new Date(purchaseOrder.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
              </div>

              {purchaseOrder.status !== 'Draft' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ['Sent', 'Confirmed', 'Receiving', 'Completed'].includes(purchaseOrder.status)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Clock size={20} />
                    </div>
                    <div className={`w-1 flex-grow mt-2 ${
                      ['Confirmed', 'Receiving', 'Completed'].includes(purchaseOrder.status)
                        ? 'bg-gray-200'
                        : 'bg-gray-100'
                    }`} style={{ height: '40px' }}></div>
                  </div>
                  <div className="pb-8">
                    <div className="font-semibold text-gray-900">Sent to Supplier</div>
                    <div className="text-sm text-gray-600">
                      {purchaseOrder.sentAt ? new Date(purchaseOrder.sentAt).toLocaleDateString('vi-VN') : 'Date TBD'}
                    </div>
                  </div>
                </div>
              )}

              {['Confirmed', 'Receiving', 'Completed'].includes(purchaseOrder.status) && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ['Receiving', 'Completed'].includes(purchaseOrder.status)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Check size={20} />
                    </div>
                    <div className={`w-1 flex-grow mt-2 ${
                      ['Completed'].includes(purchaseOrder.status)
                        ? 'bg-gray-200'
                        : 'bg-gray-100'
                    }`} style={{ height: '40px' }}></div>
                  </div>
                  <div className="pb-8">
                    <div className="font-semibold text-gray-900">Order Confirmed</div>
                    <div className="text-sm text-gray-600">
                      {purchaseOrder.confirmedAt ? new Date(purchaseOrder.confirmedAt).toLocaleDateString('vi-VN') : 'Date TBD'}
                    </div>
                  </div>
                </div>
              )}

              {['Receiving', 'Completed'].includes(purchaseOrder.status) && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      purchaseOrder.status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Truck size={20} />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Goods Receiving</div>
                    <div className="text-sm text-gray-600">In progress or completed</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
