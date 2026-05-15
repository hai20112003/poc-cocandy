import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, Edit, Check, X, Send, Clock, FileText, Package } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'
import { usePRWorkflow } from '@/hooks/useWorkflow'

export function PRDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'items' | 'timeline'>('items')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const purchaseRequest = useProcurementStore((state) => state.getPurchaseRequest(id || ''))
  const { submitPR, approvePR, rejectPR } = usePRWorkflow()

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
      case 'High':
      case 'Urgent':
        return 'text-red-600 bg-red-50'
      case 'medium':
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
      case 'Low':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const totalEstimated = purchaseRequest.items.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0)

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
              Danh sách PR
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                {purchaseRequest.code}
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(purchaseRequest.status)}`}>
                  {purchaseRequest.status === 'Draft' && '◌ Draft'}
                  {purchaseRequest.status === 'Submitted' && '⏳ Submitted'}
                  {purchaseRequest.status === 'Approved' && '✓ Approved'}
                  {purchaseRequest.status === 'Rejected' && '✕ Rejected'}
                  {purchaseRequest.status === 'Converted' && '→ Converted'}
                </span>
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                {purchaseRequest.createdBy} · {new Date(purchaseRequest.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {purchaseRequest.status === 'Draft' && (
              <>
                <button
                  onClick={() => navigate(`/purchase-requests/${id}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit size={18} />
                  Sửa
                </button>
                <button
                  onClick={() => submitPR(id || '')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Send size={18} />
                  Gửi duyệt
                </button>
              </>
            )}
            {purchaseRequest.status === 'Submitted' && (
              <>
                <button
                  onClick={() => approvePR(id || '', 'Manager')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Check size={18} />
                  Duyệt
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <X size={18} />
                  Từ chối
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">Bộ phận</div>
            <div className="font-semibold text-gray-900">{purchaseRequest.department}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">Ưu tiên</div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(purchaseRequest.priority)}`}>
              {purchaseRequest.priority}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">Tổng ước tính</div>
            <div className="text-lg font-semibold text-gray-900">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalEstimated)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-2">Cần hàng lúc</div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date(purchaseRequest.neededDate).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin yêu cầu</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-600">Bộ phận yêu cầu</div>
                    <div className="font-medium text-gray-900">{purchaseRequest.department}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Người yêu cầu</div>
                    <div className="font-medium text-gray-900">{purchaseRequest.createdBy}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Ngày tạo</div>
                    <div className="font-medium text-gray-900">{new Date(purchaseRequest.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Cần hàng lúc</div>
                    <div className="font-medium text-gray-900">{new Date(purchaseRequest.neededDate).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin duyệt</h3>
                <div className="space-y-3 text-sm">
                  {purchaseRequest.status === 'Approved' && (
                    <>
                      <div>
                        <div className="text-gray-600">Duyệt bởi</div>
                        <div className="font-medium text-gray-900">{purchaseRequest.approvedBy || '-'}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Ngày duyệt</div>
                        <div className="font-medium text-gray-900">
                          {purchaseRequest.approvedAt ? new Date(purchaseRequest.approvedAt).toLocaleDateString('vi-VN') : '-'}
                        </div>
                      </div>
                    </>
                  )}
                  {purchaseRequest.status === 'Rejected' && (
                    <>
                      <div>
                        <div className="text-gray-600">Lý do từ chối</div>
                        <div className="text-red-600 font-medium">{purchaseRequest.rejectionReason || 'Không có lý do'}</div>
                      </div>
                    </>
                  )}
                  {purchaseRequest.status === 'Draft' && (
                    <div className="text-gray-600 text-sm">Chờ gửi duyệt</div>
                  )}
                  {purchaseRequest.status === 'Submitted' && (
                    <div className="text-gray-600 text-sm">Chờ phê duyệt</div>
                  )}
                  {purchaseRequest.status === 'Converted' && (
                    <div className="text-gray-600 text-sm">Đã chuyển thành PO</div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Danh sách mặt hàng ({purchaseRequest.items.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Mặt hàng</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Thông số</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">SL</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">ĐVT</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Giá ước tính</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRequest.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
                        <td className="px-4 py-3 text-gray-600">{item.specification}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-600">{item.unit}</td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.estimatedPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            item.estimatedPrice * item.quantity
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GRN History Card */}
            {['Approved', 'Converted'].includes(purchaseRequest.status) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">📦 Lịch sử nhập kho (GRN)</h3>
                    <p className="text-sm text-gray-600 mt-1">Các phiếu nhập kho liên kết với yêu cầu này</p>
                  </div>
                  <button
                    onClick={() => navigate('/goods-receipts/add')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    + Tạo GRN
                  </button>
                </div>
                <div className="p-6 text-center text-gray-600">
                  <p className="text-sm">Chưa có GRN nào. Hãy tạo GRN mới để bắt đầu nhập kho.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Implementation Progress */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Tiến độ thực hiện</h3>
              <div className="space-y-3 text-xs">
                {/* Draft */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">✓</div>
                    {purchaseRequest.status !== 'Draft' && <div className="w-0.5 h-5 bg-green-200" />}
                  </div>
                  <div className="pb-1">
                    <div className="font-semibold text-gray-900">Soạn thảo</div>
                    <div className="text-gray-600">{new Date(purchaseRequest.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>

                {/* Submitted */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                      ['Submitted', 'Approved', 'Rejected', 'Converted'].includes(purchaseRequest.status)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {['Submitted', 'Approved', 'Rejected', 'Converted'].includes(purchaseRequest.status) ? '✓' : '○'}
                    </div>
                    {['Approved', 'Rejected', 'Converted'].includes(purchaseRequest.status) && (
                      <div className="w-0.5 h-5 bg-green-200" />
                    )}
                  </div>
                  <div className="pb-1">
                    <div className="font-semibold text-gray-900">Đã gửi duyệt</div>
                    <div className="text-gray-600">Gửi duyệt</div>
                  </div>
                </div>

                {/* Approved/Rejected */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                      ['Approved', 'Converted'].includes(purchaseRequest.status)
                        ? 'bg-green-100 text-green-700'
                        : purchaseRequest.status === 'Rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {['Approved', 'Converted'].includes(purchaseRequest.status) ? '✓' :
                       purchaseRequest.status === 'Rejected' ? '✕' : '○'}
                    </div>
                    {['Approved', 'Converted'].includes(purchaseRequest.status) && (
                      <div className="w-0.5 h-5 bg-green-200" />
                    )}
                  </div>
                  <div className="pb-1">
                    <div className="font-semibold text-gray-900">{purchaseRequest.status === 'Rejected' ? 'Từ chối' : 'Đã duyệt'}</div>
                    <div className="text-gray-600">
                      {purchaseRequest.status === 'Approved' && purchaseRequest.approvedAt
                        ? new Date(purchaseRequest.approvedAt).toLocaleDateString('vi-VN')
                        : purchaseRequest.status === 'Rejected'
                        ? 'Từ chối'
                        : '—'}
                    </div>
                  </div>
                </div>

                {/* Receiving (GRN #2 chờ) */}
                {['Approved', 'Converted'].includes(purchaseRequest.status) && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center">
                        <Package size={14} />
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Nhập kho</div>
                      <div className="text-yellow-600 font-medium">GRN #2 chờ</div>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Summary Card */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tóm tắt</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-gray-600">Số lượng dòng</div>
                  <div className="font-medium text-blue-900">{purchaseRequest.items.length} dòng</div>
                </div>
                <div>
                  <div className="text-gray-600">Tổng ước tính</div>
                  <div className="font-semibold text-lg text-blue-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalEstimated)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Trạng thái</div>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getStatusColor(purchaseRequest.status)}`}>
                    {purchaseRequest.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Modal */}
        {showRejectForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Từ chối yêu cầu mua hàng</h2>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Lý do từ chối..."
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
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (rejectionReason.trim()) {
                      rejectPR(id || '', rejectionReason, 'Manager')
                      setShowRejectForm(false)
                      navigate('/purchase-requests')
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
