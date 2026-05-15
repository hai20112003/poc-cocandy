import { useState, useMemo } from 'react'
import { useProcurementStore } from '../../../store/procurementStore'

export function POList() {
  const { purchaseOrders } = useProcurementStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch = po.code.toLowerCase().includes(search.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || po.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [purchaseOrders, search, statusFilter])

  const stats = {
    active: purchaseOrders.filter(po => ['Confirmed', 'Receiving'].includes(po.status)).length,
    awaiting: purchaseOrders.filter(po => po.status === 'Sent').length,
    completed: purchaseOrders.filter(po => po.status === 'Completed').length,
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Draft': return 'bg-gray-100 text-gray-700'
      case 'Sent': return 'bg-yellow-100 text-yellow-700'
      case 'Confirmed': return 'bg-blue-100 text-blue-700'
      case 'Receiving': return 'bg-orange-100 text-orange-700'
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'Cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn Đặt Hàng</h1>
            <p className="text-sm text-gray-500 mt-1">{purchaseOrders.length} đơn hàng · Cập nhật 15/05/2026</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            + Tạo PO
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 py-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Active', value: stats.active, icon: '⚡' },
          { label: 'Awaiting Confirmation', value: stats.awaiting, icon: '⏳' },
          { label: 'Completed', value: stats.completed, icon: '✓' },
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
            placeholder="Tìm PO theo mã hoặc nhà cung cấp..."
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
            <option>Draft</option>
            <option>Sent</option>
            <option>Confirmed</option>
            <option>Receiving</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Mã PO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Nhà Cung Cấp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tổng Tiền</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 text-sm text-blue-600 font-medium">{po.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{po.supplierName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(po.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {(po.total / 1000000).toFixed(1)}M đ
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(po.status)}`}>
                      {po.status}
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
