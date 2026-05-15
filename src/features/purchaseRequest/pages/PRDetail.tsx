import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, Edit, Check, X, Send, Clock } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'

export function PRDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'items' | 'timeline'>('items')
  const purchaseRequest = useProcurementStore((state) => state.getPurchaseRequest(id || ''))

  if (!purchaseRequest) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Purchase Request Not Found</h1>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      case 'Submitted':
        return 'bg-blue-100 text-blue-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Converted':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">{purchaseRequest.code}</h1>
            <p className="text-gray-600">Purchase Request</p>
          </div>
        </div>
        {purchaseRequest.status === 'Draft' && (
          <button
            onClick={() => navigate(`/purchase-requests/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit size={18} />
            Edit
          </button>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Status</div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchaseRequest.status)}`}>
            {purchaseRequest.status}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Priority</div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(purchaseRequest.priority)}`}>
            {purchaseRequest.priority.charAt(0).toUpperCase() + purchaseRequest.priority.slice(1)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Total Estimate</div>
          <div className="text-lg font-semibold text-gray-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(purchaseRequest.totalEstimated)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Needed By</div>
          <div className="text-lg font-semibold text-gray-900">{new Date(purchaseRequest.neededDate).toLocaleDateString('vi-VN')}</div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Department</div>
              <div className="text-gray-900">{purchaseRequest.department}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Requester</div>
              <div className="text-gray-900">{purchaseRequest.createdBy}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Created Date</div>
              <div className="text-gray-900">{new Date(purchaseRequest.createdAt).toLocaleDateString('vi-VN')}</div>
            </div>
            {purchaseRequest.notes && (
              <div>
                <div className="text-sm text-gray-600">Notes</div>
                <div className="text-gray-900">{purchaseRequest.notes}</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Information</h3>
          <div className="space-y-3">
            {purchaseRequest.status === 'Approved' && (
              <>
                <div>
                  <div className="text-sm text-gray-600">Approved By</div>
                  <div className="text-gray-900">{purchaseRequest.approvedBy}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Approval Date</div>
                  <div className="text-gray-900">
                    {purchaseRequest.approvedAt ? new Date(purchaseRequest.approvedAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </div>
                </div>
              </>
            )}
            {purchaseRequest.status === 'Rejected' && (
              <>
                <div>
                  <div className="text-sm text-gray-600">Rejection Reason</div>
                  <div className="text-red-600">{purchaseRequest.rejectionReason || 'No reason provided'}</div>
                </div>
              </>
            )}
            {purchaseRequest.status === 'Draft' && (
              <div className="text-sm text-gray-600">Awaiting submission</div>
            )}
            {purchaseRequest.status === 'Submitted' && (
              <div className="text-sm text-gray-600">Pending approval</div>
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
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Product Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Specification</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Unit</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Est. Price</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Suggested Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseRequest.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-900 font-medium">{item.productName}</td>
                      <td className="px-6 py-4 text-gray-600">{item.specification}</td>
                      <td className="px-6 py-4 text-right text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-gray-600">{item.unit}</td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.estimatedPrice)}
                      </td>
                      <td className="px-6 py-4 text-blue-600">{item.suggestedSupplier || 'TBD'}</td>
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
                    <Clock size={20} />
                  </div>
                  <div className="w-1 flex-grow bg-gray-200 mt-2" style={{ height: '40px' }}></div>
                </div>
                <div className="pb-8">
                  <div className="font-semibold text-gray-900">Created</div>
                  <div className="text-sm text-gray-600">{new Date(purchaseRequest.createdAt).toLocaleDateString('vi-VN')}</div>
                  <div className="text-sm text-gray-600">by {purchaseRequest.createdBy}</div>
                </div>
              </div>

              {purchaseRequest.status !== 'Draft' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ['Submitted', 'Approved', 'Converted'].includes(purchaseRequest.status)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Send size={20} />
                    </div>
                    <div className={`w-1 flex-grow mt-2 ${
                      ['Approved', 'Converted'].includes(purchaseRequest.status)
                        ? 'bg-gray-200'
                        : 'bg-gray-100'
                    }`} style={{ height: '40px' }}></div>
                  </div>
                  <div className="pb-8">
                    <div className="font-semibold text-gray-900">Submitted</div>
                    <div className="text-sm text-gray-600">Ready for approval</div>
                  </div>
                </div>
              )}

              {purchaseRequest.status === 'Approved' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                      <Check size={20} />
                    </div>
                    <div className="w-1 flex-grow bg-gray-200 mt-2" style={{ height: '40px' }}></div>
                  </div>
                  <div className="pb-8">
                    <div className="font-semibold text-gray-900">Approved</div>
                    <div className="text-sm text-gray-600">
                      {purchaseRequest.approvedAt ? new Date(purchaseRequest.approvedAt).toLocaleDateString('vi-VN') : 'Date TBD'}
                    </div>
                    <div className="text-sm text-gray-600">by {purchaseRequest.approvedBy}</div>
                  </div>
                </div>
              )}

              {purchaseRequest.status === 'Rejected' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700">
                      <X size={20} />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Rejected</div>
                    <div className="text-sm text-red-600">{purchaseRequest.rejectionReason}</div>
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
