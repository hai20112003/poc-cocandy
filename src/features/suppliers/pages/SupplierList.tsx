import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProcurementStore } from '../../../store/procurementStore'

export function SupplierList() {
  const navigate = useNavigate()
  const suppliers = useProcurementStore((state) => state.suppliers)
  const purchaseOrders = useProcurementStore((state) => state.purchaseOrders)
  const getContractsBySupplier = useProcurementStore((state) => state.getContractsBySupplier)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || s.status === statusFilter
      const matchType = typeFilter === 'All' || s.type === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [suppliers, search, statusFilter, typeFilter])

  const stats = useMemo(() => ({
    active: suppliers.filter(s => s.status === 'Active').length,
    suspended: suppliers.filter(s => s.status === 'Suspended').length,
    blacklisted: suppliers.filter(s => s.status === 'Blacklisted').length,
    withContract: suppliers.filter(s => {
      const supplierContracts = getContractsBySupplier(s.id)
      return supplierContracts.some(c => c.status === 'Active')
    }).length,
  }), [suppliers, getContractsBySupplier])

  const getContractStatus = useMemo(() => (supplierId: string) => {
    const supplierContracts = getContractsBySupplier(supplierId)
    const active = supplierContracts.find(c => c.status === 'Active')
    if (active) return { status: 'Active', label: 'Có HĐ' }
    if (supplierContracts.length > 0) return { status: 'Inactive', label: 'Hết HĐ' }
    return { status: 'None', label: 'Không có' }
  }, [getContractsBySupplier])

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()

  const poValues = useMemo(() => {
    const values: Record<string, number> = {}
    purchaseOrders.forEach(po => {
      values[po.supplierId] = (values[po.supplierId] || 0) + po.total
    })
    return values
  }, [purchaseOrders])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản Lý Nhà Cung Cấp</h1>
            <p className="text-sm text-gray-500 mt-1">{suppliers.length} nhà cung cấp · Cập nhật 15/05/2026</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
              ↓ Xuất
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
              ⚙ Cấu hình đánh giá
            </button>
            <button onClick={() => navigate('/suppliers/add')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              + Thêm NCC
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 py-6 grid grid-cols-4 gap-4">
        {[
          { label: 'Đang hoạt động', value: stats.active, color: 'text-green-600' },
          { label: 'Tạm ngưng', value: stats.suspended, color: 'text-yellow-600' },
          { label: 'Bị chặn', value: stats.blacklisted, color: 'text-red-600' },
          { label: 'Có hợp đồng', value: stats.withContract, color: 'text-blue-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex gap-4 items-center mb-4">
          <input
            type="text"
            placeholder="Tìm theo tên, mã, người liên hệ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-2">
            {['All', 'Active', 'Suspended', 'Blacklisted'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'All' ? 'Tất cả' : status === 'Active' ? 'Hoạt động' : status === 'Suspended' ? 'Tạm ngưng' : 'Bị chặn'}
              </button>
            ))}
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="All">Loại: Tất cả</option>
            <option value="Manufacturer">Nhà sản xuất</option>
            <option value="Trader">Thương nhân</option>
            <option value="Individual">Cá nhân</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Mã NCC</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tên công ty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Loại</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Lead time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Điều khoản TT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tổng PO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Hợp đồng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((supplier) => {
                const contractStatus = getContractStatus(supplier.id)
                const contactInfo = supplier.contacts[0]
                const poTotal = poValues[supplier.id] || 0
                return (
                  <tr key={supplier.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/suppliers/${supplier.id}`)}>
                    <td className="px-4 py-3 text-sm text-blue-600 font-medium">{supplier.code}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
                          {getInitials(supplier.name)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-xs text-gray-500">
                            {contactInfo ? `${contactInfo.name} · ${contactInfo.phone}` : '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {supplier.type === 'Manufacturer' ? 'Nhà sản xuất' : supplier.type === 'Trader' ? 'Thương nhân' : 'Cá nhân'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{supplier.leadTime} ngày</td>
                    <td className="px-4 py-3 text-sm">{supplier.paymentTerms}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {(poTotal / 1000000).toFixed(0)}M
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-yellow-500">★★★★★</span>
                      <span className="ml-1 font-semibold text-green-600">{supplier.rating.toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        contractStatus.status === 'Active' ? 'bg-green-100 text-green-700' :
                        contractStatus.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {contractStatus.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        supplier.status === 'Active' ? 'bg-green-100 text-green-700' :
                        supplier.status === 'Suspended' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {supplier.status === 'Active' ? '● Hoạt động' :
                         supplier.status === 'Suspended' ? '○ Tạm ngưng' :
                         '✕ Bị chặn'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
