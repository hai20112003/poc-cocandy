import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, Edit, CheckCircle, AlertCircle, Clock, FileText, Package, Undo2, Check } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'
import { useGRNWorkflow } from '@/hooks/useWorkflow'

export function GRNDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'items' | 'returns' | 'timeline'>('items')
  const goodsReceipt = useProcurementStore((state) => state.getGoodsReceipt(id || ''))
  const { submitGRN, completeReceiving, startQC, completeQC, rejectQC } = useGRNWorkflow()
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const purchaseOrder = goodsReceipt ? useProcurementStore((state) => state.getPurchaseOrder(goodsReceipt.poId)) : null
  const supplier = purchaseOrder ? useProcurementStore((state) => state.getSupplier(purchaseOrder.supplierId)) : null

  if (!goodsReceipt) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Goods Receipt Not Found</h1>
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
      case 'Received':
        return 'bg-purple-100 text-purple-800'
      case 'QC In Progress':
        return 'bg-orange-100 text-orange-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getQCStatusIcon = (status: string) => {
    switch (status) {
      case 'Pass':
        return <CheckCircle size={20} className="text-green-600" />
      case 'Fail':
        return <AlertCircle size={20} className="text-red-600" />
      case 'Pending':
        return <Clock size={20} className="text-yellow-600" />
      default:
        return <Clock size={20} className="text-gray-400" />
    }
  }

  const getQCStatusColor = (status: string) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-50 text-green-800'
      case 'Fail':
        return 'bg-red-50 text-red-800'
      case 'Pending':
        return 'bg-yellow-50 text-yellow-800'
      default:
        return 'bg-gray-50 text-gray-800'
    }
  }

  const totalReceived = goodsReceipt.items.reduce((sum, item) => sum + item.quantityReceived, 0)

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
            <h1 className="text-3xl font-bold text-gray-900">{goodsReceipt.code}</h1>
            <p className="text-gray-600">Goods Receipt Note</p>
          </div>
        </div>
        <div className="flex gap-2">
          {goodsReceipt.status === 'Draft' && (
            <>
              <button
                onClick={() => navigate(`/goods-receipts/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                onClick={() => submitGRN(id || '')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Check size={18} />
                Submit
              </button>
            </>
          )}
          {goodsReceipt.status === 'Submitted' && (
            <button
              onClick={() => completeReceiving(id || '')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Check size={18} />
              Confirm Received
            </button>
          )}
          {goodsReceipt.status === 'Received' && (
            <button
              onClick={() => startQC(id || '', 'Inspector')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              <CheckCircle size={18} />
              Start QC
            </button>
          )}
          {goodsReceipt.status === 'QC In Progress' && (
            <>
              <button
                onClick={() => completeQC(id || '')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Check size={18} />
                Pass QC
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <AlertCircle size={18} />
                Fail QC
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Status</div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(goodsReceipt.status)}`}>
            {goodsReceipt.status}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">QC Status</div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getQCStatusColor(goodsReceipt.qcStatus)}`}>
            {goodsReceipt.qcStatus}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Total Received</div>
          <div className="text-lg font-semibold text-gray-900">{totalReceived} items</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Supplier</div>
          <div className="text-lg font-semibold text-gray-900">{supplier?.name || 'Unknown'}</div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Information</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Related PO</div>
              <button
                onClick={() => navigate(`/orders/${goodsReceipt.poId}`)}
                className="text-blue-600 hover:underline"
              >
                {purchaseOrder?.code || 'Unknown'}
              </button>
            </div>
            <div>
              <div className="text-sm text-gray-600">Received Date</div>
              <div className="text-gray-900">{new Date(goodsReceipt.receivedDate).toLocaleDateString('vi-VN')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Received By</div>
              <div className="text-gray-900">{goodsReceipt.receivedBy}</div>
            </div>
            {goodsReceipt.warehouseLocation && (
              <div>
                <div className="text-sm text-gray-600">Warehouse Location</div>
                <div className="text-gray-900">{goodsReceipt.warehouseLocation}</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">QC Information</h3>
          <div className="space-y-3">
            {goodsReceipt.qcStartedAt && (
              <div>
                <div className="text-sm text-gray-600">QC Started Date</div>
                <div className="text-gray-900">{new Date(goodsReceipt.qcStartedAt).toLocaleDateString('vi-VN')}</div>
              </div>
            )}
            {goodsReceipt.qcCompletedAt && (
              <div>
                <div className="text-sm text-gray-600">QC Completed Date</div>
                <div className="text-gray-900">{new Date(goodsReceipt.qcCompletedAt).toLocaleDateString('vi-VN')}</div>
              </div>
            )}
            {goodsReceipt.qcInspector && (
              <div>
                <div className="text-sm text-gray-600">QC Inspector</div>
                <div className="text-gray-900">{goodsReceipt.qcInspector}</div>
              </div>
            )}
            {goodsReceipt.notes && (
              <div>
                <div className="text-sm text-gray-600">Notes</div>
                <div className="text-gray-900">{goodsReceipt.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Fail QC</h2>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for QC failure"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectForm(false)
                  setRejectionReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rejectionReason.trim()) {
                    rejectQC(id || '', rejectionReason)
                    setShowRejectForm(false)
                    navigate('/goods-receipts')
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Fail QC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex border-b border-gray-200">
          {(['items', 'returns', 'timeline'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'items' ? 'Items' : tab === 'returns' ? 'Returns' : 'Timeline'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'items' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Tên hàng</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20">SL đặt PO</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20">Thực nhận</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20">Chấp nhận</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20">Từ chối</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20">Còn lại</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-24">Số lô</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-24">Vị trí kho</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">QC Note</th>
                  </tr>
                </thead>
                <tbody>
                  {goodsReceipt.items.map((item) => {
                    const remaining = item.expectedQty - item.acceptedQty - item.rejectedQty
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
                        <td className="px-4 py-3 text-center text-gray-900">{item.expectedQty}{item.unit}</td>
                        <td className="px-4 py-3 text-center text-gray-900">{item.receivedQty}{item.unit}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            value={item.acceptedQty}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center text-sm"
                            readOnly
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            value={item.rejectedQty}
                            className={`w-full px-2 py-1 border rounded text-center text-sm ${
                              item.rejectedQty > 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            readOnly
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold text-sm ${
                            remaining === 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {remaining}{item.unit} {remaining === 0 ? '✓' : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{item.batchNo || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{item.storageLocation || '—'}</td>
                        <td className="px-4 py-3 text-xs">
                          {item.qcStatus === 'Pass' ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded inline-block">✓ {item.notes}</span>
                          ) : item.qcStatus === 'Pending' ? (
                            <span className="text-yellow-600">⏳ {item.notes}</span>
                          ) : (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded inline-block">✕ {item.notes}</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'returns' && (
            <div>
              {goodsReceipt.returns && goodsReceipt.returns.length > 0 ? (
                <div className="space-y-4">
                  {goodsReceipt.returns.map((returnItem) => (
                    <div key={returnItem.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{returnItem.productName}</div>
                          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                            <div>
                              <div className="text-gray-600">Quantity Returned</div>
                              <div className="text-gray-900">{returnItem.quantityReturned}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Reason</div>
                              <div className="text-gray-900">{returnItem.reason}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Return Date</div>
                              <div className="text-gray-900">{new Date(returnItem.returnDate).toLocaleDateString('vi-VN')}</div>
                            </div>
                            {returnItem.notes && (
                              <div>
                                <div className="text-gray-600">Notes</div>
                                <div className="text-gray-900">{returnItem.notes}</div>
                              </div>
                            )}
                          </div>
                        </div>
                        <Undo2 size={24} className="text-orange-600" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <Package size={40} className="mx-auto mb-2 text-gray-400" />
                  <p>No returns recorded</p>
                </div>
              )}
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
                  <div className="text-sm text-gray-600">{new Date(goodsReceipt.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
              </div>

              {goodsReceipt.status !== 'Draft' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ['Received', 'QC In Progress', 'Completed', 'Rejected'].includes(goodsReceipt.status)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Package size={20} />
                    </div>
                    <div className={`w-1 flex-grow mt-2 ${
                      ['QC In Progress', 'Completed', 'Rejected'].includes(goodsReceipt.status)
                        ? 'bg-gray-200'
                        : 'bg-gray-100'
                    }`} style={{ height: '40px' }}></div>
                  </div>
                  <div className="pb-8">
                    <div className="font-semibold text-gray-900">Goods Received</div>
                    <div className="text-sm text-gray-600">
                      {goodsReceipt.receivedDate ? new Date(goodsReceipt.receivedDate).toLocaleDateString('vi-VN') : 'Date TBD'}
                    </div>
                  </div>
                </div>
              )}

              {['QC In Progress', 'Completed', 'Rejected'].includes(goodsReceipt.status) && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ['Completed', 'Rejected'].includes(goodsReceipt.status)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      <Clock size={20} />
                    </div>
                    {goodsReceipt.status !== 'Rejected' && (
                      <div className={`w-1 flex-grow mt-2 ${
                        goodsReceipt.status === 'Completed'
                          ? 'bg-gray-200'
                          : 'bg-gray-100'
                      }`} style={{ height: '40px' }}></div>
                    )}
                  </div>
                  <div className="pb-8">
                    <div className="font-semibold text-gray-900">QC Inspection</div>
                    <div className="text-sm text-gray-600">
                      {goodsReceipt.qcStartedAt ? new Date(goodsReceipt.qcStartedAt).toLocaleDateString('vi-VN') : 'In progress'}
                    </div>
                  </div>
                </div>
              )}

              {goodsReceipt.status === 'Rejected' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700">
                      <AlertCircle size={20} />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Rejected</div>
                    <div className="text-sm text-red-600">Quality check failed</div>
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
