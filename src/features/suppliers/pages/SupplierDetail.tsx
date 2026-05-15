import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { ChevronLeft, Edit, Plus, Phone, Mail, Package, Star, FileText } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'

export function SupplierDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'products' | 'evaluations' | 'contracts' | 'orders'>('overview')
  const supplier = useMemo(() => useProcurementStore.getState().getSupplier(id || ''), [id])
  const evaluations = useMemo(() => useProcurementStore.getState().getEvaluationsBySupplier(id || ''), [id])
  const contracts = useMemo(() => useProcurementStore.getState().getContractsBySupplier(id || ''), [id])
  const purchaseOrders = useProcurementStore((state) => state.purchaseOrders)
  const linkedOrders = useMemo(() => purchaseOrders.filter((po) => po.supplierId === id), [purchaseOrders, id])

  const kpiMetrics = useMemo(() => {
    const totalPOs = linkedOrders.length
    const totalValue = linkedOrders.reduce((sum, po) => sum + po.total, 0)
    // On-time delivery calculation (assuming if no cancelledAt, it was on-time)
    const onTimeCount = linkedOrders.filter(po => po.status === 'Completed').length
    const onTimePercent = linkedOrders.length > 0 ? Math.round((onTimeCount / linkedOrders.length) * 100) : 0

    return {
      totalPOs,
      totalValue,
      onTimePercent,
      rating: supplier?.rating || 0
    }
  }, [linkedOrders, supplier])

  if (!supplier) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Supplier Not Found</h1>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Suspended':
        return 'bg-yellow-100 text-yellow-800'
      case 'Blacklisted':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRatingStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 !== 0
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>)
      } else if (i === fullStars && hasHalf) {
        stars.push(<span key={i} className="text-yellow-400">◐</span>)
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>)
      }
    }
    return stars
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
            <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
            <p className="text-gray-600">{supplier.code}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/suppliers/${id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Edit size={18} />
          Edit
        </button>
      </div>

      {/* Status and Rating Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Status</div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(supplier.status)}`}>
            {supplier.status}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Rating</div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">{getRatingStars(supplier.rating)}</div>
            <span className="text-lg font-semibold text-gray-900">{supplier.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-2">Type</div>
          <div className="text-lg font-semibold text-gray-900">{supplier.type}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[
            { key: 'overview' as const, label: 'Tổng quan' },
            { key: 'contracts' as const, label: `Hợp đồng (${contracts.length})` },
            { key: 'orders' as const, label: `Đơn hàng (${linkedOrders.length})` },
            { key: 'products' as const, label: `Hàng hóa (${supplier?.products.length || 0})` },
            { key: 'contacts' as const, label: `Liên hệ (${supplier?.contacts.length || 0})` },
            { key: 'evaluations' as const, label: `Đánh giá (${evaluations.length} kỳ)` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-3 font-medium transition whitespace-nowrap ${
                activeTab === key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-blue-600 font-bold text-2xl">{kpiMetrics.totalPOs}</div>
                  <div className="text-gray-600 text-sm mt-1">Tổng PO</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-green-600 font-bold text-2xl">{(kpiMetrics.totalValue / 1000000).toFixed(0)}M</div>
                  <div className="text-gray-600 text-sm mt-1">Giá trị mua tích lũy</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-yellow-600 font-bold text-2xl">{kpiMetrics.onTimePercent}%</div>
                  <div className="text-gray-600 text-sm mt-1">On-time delivery</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-purple-600 font-bold text-2xl">{kpiMetrics.rating.toFixed(1)}</div>
                  <div className="text-gray-600 text-sm mt-1">Rating tổng hợp</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Mã</div>
                      <div className="text-gray-900">{supplier.code}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Mã số thuế</div>
                      <div className="text-gray-900">{supplier.taxId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Loại</div>
                      <div className="text-gray-900">{supplier.type}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Điều khoản</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Lead time</div>
                      <div className="text-gray-900">{supplier.leadTime} ngày</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Điều khoản thanh toán</div>
                      <div className="text-gray-900">{supplier.paymentTerms}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Tiền tệ</div>
                      <div className="text-gray-900">{supplier.currency}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên hệ</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Địa chỉ</div>
                    <div className="text-gray-900">{supplier.address}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Điện thoại</div>
                      <div className="text-gray-900">{supplier.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="text-blue-600">{supplier.email}</div>
                    </div>
                  </div>
                </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                  {/* Rating card */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-lg font-semibold text-gray-900 mb-4">Điểm đánh giá</div>
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold text-gray-900">{supplier.rating.toFixed(1)}</div>
                      <div className="text-yellow-400 text-2xl mt-2">★★★★★</div>
                      <div className="text-xs text-gray-500 mt-2">Dựa trên {evaluations.length} kỳ đánh giá</div>
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      {evaluations.length > 0 && (
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Chất lượng</span>
                              <span className="text-gray-900 font-semibold">{evaluations[evaluations.length - 1]?.qualityScore || 0}/5</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded h-2">
                              <div className="bg-green-600 h-2 rounded" style={{width: `${(evaluations[evaluations.length - 1]?.qualityScore || 0) * 20}%`}}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Giao hàng</span>
                              <span className="text-gray-900 font-semibold">{evaluations[evaluations.length - 1]?.deliveryScore || 0}/5</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded h-2">
                              <div className="bg-yellow-500 h-2 rounded" style={{width: `${(evaluations[evaluations.length - 1]?.deliveryScore || 0) * 20}%`}}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Giá cả</span>
                              <span className="text-gray-900 font-semibold">{evaluations[evaluations.length - 1]?.priceScore || 0}/5</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded h-2">
                              <div className="bg-green-600 h-2 rounded" style={{width: `${(evaluations[evaluations.length - 1]?.priceScore || 0) * 20}%`}}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Hỗ trợ</span>
                              <span className="text-gray-900 font-semibold">{evaluations[evaluations.length - 1]?.serviceScore || 0}/5</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded h-2">
                              <div className="bg-green-600 h-2 rounded" style={{width: `${(evaluations[evaluations.length - 1]?.serviceScore || 0) * 20}%`}}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contract card */}
                  {contracts.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-semibold text-gray-900">Hợp đồng hiện hành</div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">● Active</span>
                      </div>
                      {contracts.filter(c => c.status === 'Active').length > 0 ? (
                        <div className="bg-gray-50 rounded p-3 border border-gray-200">
                          <div className="text-sm font-semibold text-blue-600 mb-1">
                            {contracts.find(c => c.status === 'Active')?.contractNo}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {contracts.find(c => c.status === 'Active')?.startDate.toLocaleDateString('vi-VN')} – {contracts.find(c => c.status === 'Active')?.endDate.toLocaleDateString('vi-VN')}
                          </div>
                          <div className="text-xs text-gray-700 mb-3">
                            {contracts.find(c => c.status === 'Active')?.paymentTerms} · Giảm {contracts.find(c => c.status === 'Active')?.discountRate}%
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Tiến độ hợp đồng</span>
                              <span>{Math.round(((Date.now() - contracts.find(c => c.status === 'Active')!.startDate.getTime()) / (contracts.find(c => c.status === 'Active')!.endDate.getTime() - contracts.find(c => c.status === 'Active')!.startDate.getTime())) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded h-2">
                              <div className="bg-blue-600 h-2 rounded" style={{width: `${Math.min(100, Math.round(((Date.now() - contracts.find(c => c.status === 'Active')!.startDate.getTime()) / (contracts.find(c => c.status === 'Active')!.endDate.getTime() - contracts.find(c => c.status === 'Active')!.startDate.getTime())) * 100))}%`}}></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">Không có hợp đồng hoạt động</div>
                      )}
                    </div>
                  )}

                  {/* Status card */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-lg font-semibold text-gray-900 mb-4">Quản lý trạng thái</div>
                    <div className={`p-3 rounded border mb-3 ${supplier.status === 'Active' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="text-sm font-semibold mb-1">
                        {supplier.status === 'Active' ? '✅ Hoạt động' : supplier.status === 'Suspended' ? '⏸ Tạm ngưng' : '⛔ Bị chặn'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {supplier.status === 'Active' ? 'Hoạt động bình thường' : supplier.status === 'Suspended' ? 'Tạm dừng hợp tác' : 'Đã bị chặn từ hệ thống'}
                      </div>
                    </div>
                    <button className="w-full px-3 py-2 border border-yellow-400 text-yellow-700 rounded text-sm font-medium hover:bg-yellow-50 mb-2">
                      ⏸ Tạm ngưng
                    </button>
                    <button className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">
                      ⛔ Blacklist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Liên hệ</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus size={18} />
                  Thêm liên hệ
                </button>
              </div>
              <div className="space-y-3">
                {supplier.contacts.map((contact) => (
                  <div key={contact.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{contact.title}</div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone size={16} />
                            {contact.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={16} />
                            {contact.email}
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">⋮</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hàng hóa</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus size={18} />
                  Thêm hàng
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Tên hàng</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ĐVT</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Đơn giá</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">MOQ</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Lead time</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 text-gray-600">{product.unit}</td>
                        <td className="px-6 py-4 text-gray-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{product.moq}</td>
                        <td className="px-6 py-4 text-gray-600">{product.leadTime} ngày</td>
                        <td className="px-6 py-4 text-gray-600">{product.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử đánh giá</h3>
              {evaluations.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <Star size={40} className="mx-auto mb-2 text-gray-400" />
                  <p>Chưa có đánh giá</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Kỳ</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Chất lượng</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Giao hàng</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Giá cả</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Hỗ trợ</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Tổng</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Người đánh giá</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evaluations.map((evaluation) => {
                        const totalColor =
                          evaluation.totalScore >= 4 ? 'text-green-700' : evaluation.totalScore >= 3 ? 'text-yellow-700' : 'text-red-700'
                        return (
                          <tr key={evaluation.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-gray-900 font-medium">{evaluation.period}</td>
                            <td className="px-6 py-4 text-gray-600">
                              {evaluation.qualityScore}/5 <span className="text-yellow-400">★</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {evaluation.deliveryScore}/5 <span className="text-yellow-400">★</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {evaluation.priceScore}/5 <span className="text-yellow-400">★</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {evaluation.serviceScore}/5 <span className="text-yellow-400">★</span>
                            </td>
                            <td className={`px-6 py-4 font-semibold ${totalColor}`}>{evaluation.totalScore.toFixed(1)}</td>
                            <td className="px-6 py-4 text-gray-600">{evaluation.evaluatedBy}</td>
                            <td className="px-6 py-4 text-gray-600">{evaluation.note}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contracts' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hợp đồng khung</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus size={18} />
                  Thêm hợp đồng
                </button>
              </div>
              {contracts.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <FileText size={40} className="mx-auto mb-2 text-gray-400" />
                  <p>Chưa có hợp đồng</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Số HĐ</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Từ ngày</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Đến ngày</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Điều khoản TT</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Chiết khấu</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Giá trị tối thiểu</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.map((contract) => {
                        const statusColor =
                          contract.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : contract.status === 'Draft'
                              ? 'bg-gray-100 text-gray-800'
                              : contract.status === 'Expired'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                        return (
                          <tr key={contract.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-gray-900 font-medium">{contract.contractNo}</td>
                            <td className="px-6 py-4 text-gray-600">
                              {contract.startDate.toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 text-gray-600">{contract.endDate.toLocaleDateString('vi-VN')}</td>
                            <td className="px-6 py-4 text-gray-600">{contract.paymentTerms}</td>
                            <td className="px-6 py-4 text-gray-600">{contract.discountRate}%</td>
                            <td className="px-6 py-4 text-gray-600">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                contract.minOrderValue
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                              >
                                {contract.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng</h3>
              {linkedOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <Package size={40} className="mx-auto mb-2 text-gray-400" />
                  <p>Chưa có đơn hàng</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Mã PO</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ngày</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Tổng tiền</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">On-time?</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">GRN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedOrders.map((po) => {
                        const isOnTime = po.status === 'Completed' ? true : po.status === 'Cancelled' ? false : null
                        return (
                          <tr key={po.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-blue-600 font-medium cursor-pointer hover:underline">
                              {po.code}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {po.createdAt.toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 text-gray-900">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                po.total
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {po.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {isOnTime !== null ? (
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                  isOnTime ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {isOnTime ? '✓ Đúng hạn' : '✗ Trễ'}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-600">-</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
