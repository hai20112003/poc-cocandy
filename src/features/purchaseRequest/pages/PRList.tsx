import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProcurementStore } from '../../../store/procurementStore'

export function PRList() {
  const navigate = useNavigate()
  const { purchaseRequests } = useProcurementStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = useMemo(() => {
    return purchaseRequests.filter((pr) => {
      const matchSearch = pr.code.toLowerCase().includes(search.toLowerCase()) ||
        pr.requester.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || pr.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [purchaseRequests, search, statusFilter])

  const stats = {
    pending: purchaseRequests.filter(pr => pr.status === 'Submitted').length,
    approved: purchaseRequests.filter(pr => pr.status === 'Approved').length,
    rejected: purchaseRequests.filter(pr => pr.status === 'Rejected').length,
    converted: purchaseRequests.filter(pr => pr.status === 'Converted').length,
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Urgent': return 'bg-red-100 text-red-700'
      case 'High': return 'bg-yellow-100 text-yellow-700'
      case 'Medium': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Submitted': return 'bg-yellow-100 text-yellow-700'
      case 'Approved': return 'bg-green-100 text-green-700'
      case 'Rejected': return 'bg-red-100 text-red-700'
      case 'Converted': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yêu Cầu Mua Hàng</h1>
            <p className="text-sm text-gray-500 mt-1">Purchase Request · {purchaseRequests.length} yêu cầu tổng cộng</p>
          </div>
          <button onClick={() => navigate('/purchase-requests/add')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            + Tạo PR Mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 py-6 grid grid-cols-4 gap-4">
        {[
          { label: 'Chờ duyệt', value: stats.pending, icon: '⏳' },
          { label: 'Đã duyệt', value: stats.approved, icon: '✓' },
          { label: 'Từ chối', value: stats.rejected, icon: '✕' },
          { label: 'Đã tạo PO', value: stats.converted, icon: '→' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600 mt-1">{stat.icon} {stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Tìm PR theo mã, người tạo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option>All</option>
            <option>Submitted</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Converted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Mã PR</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Người tạo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Bộ phận</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Cần hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Ưu tiên</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tổng ước tính</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((pr) => (
                <tr key={pr.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/purchase-requests/${pr.id}`)}>
                  <td className="px-4 py-3 text-sm text-blue-600 font-medium">{pr.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{pr.requester}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{pr.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(pr.neededDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(pr.priority)}`}>
                      {pr.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {(pr.total / 1000000).toFixed(1)}M đ
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(pr.status)}`}>
                      {pr.status === 'Submitted' ? '⏳ Pending' :
                       pr.status === 'Approved' ? '✓ Approved' :
                       pr.status === 'Rejected' ? '✕ Rejected' :
                       pr.status === 'Converted' ? '→ Converted' :
                       '◌ Draft'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
