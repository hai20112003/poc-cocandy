import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProcurementStore } from '../../../store/procurementStore'

export function GRNList() {
  const navigate = useNavigate()
  const { goodsReceipts } = useProcurementStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = useMemo(() => {
    return goodsReceipts.filter((grn) => {
      const matchSearch = grn.code.toLowerCase().includes(search.toLowerCase()) ||
        grn.supplierName.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || grn.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [goodsReceipts, search, statusFilter])

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Draft': return 'bg-gray-100 text-gray-700'
      case 'Submitted': return 'bg-yellow-100 text-yellow-700'
      case 'Received': return 'bg-blue-100 text-blue-700'
      case 'QC In Progress': return 'bg-orange-100 text-orange-700'
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'Rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getQCColor = (qc: string) => {
    switch(qc) {
      case 'Pass': return 'text-green-600'
      case 'Fail': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phiếu Nhập Hàng</h1>
            <p className="text-sm text-gray-500 mt-1">{goodsReceipts.length} phiếu · Cập nhật 15/05/2026</p>
          </div>
          <button onClick={() => navigate('/goods-receipts/add')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            + Tạo GRN
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Tìm GRN theo mã hoặc nhà cung cấp..."
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
            <option>Submitted</option>
            <option>Received</option>
            <option>QC In Progress</option>
            <option>Completed</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Mã GRN</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">PO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Nhà Cung Cấp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Ngày Nhập</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Trạng Thái</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">QC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((grn) => (
                <tr key={grn.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/goods-receipts/${grn.id}`)}>
                  <td className="px-4 py-3 text-sm text-blue-600 font-medium">{grn.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{grn.poId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{grn.supplierName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(grn.receivedDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(grn.status)}`}>
                      {grn.status}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${getQCColor(grn.items[0]?.qcStatus || 'Pending')}`}>
                    {grn.items[0]?.qcStatus || 'Pending'}
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
