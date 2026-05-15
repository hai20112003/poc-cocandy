import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, Plus, X } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'
import { ISupplier, IContact } from '../types'

export function SupplierForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const supplier = id ? useProcurementStore((state) => state.getSupplier(id)) : null
  const { addSupplier, updateSupplier } = useProcurementStore()

  const [formData, setFormData] = useState<Partial<ISupplier>>({
    name: '',
    code: '',
    type: 'Manufacturer',
    status: 'Active',
    leadTime: 0,
    paymentTerms: 'NET 30',
    minOrderValue: 0,
    website: '',
    rating: 0,
    contacts: [],
    products: [],
  })

  const [contacts, setContacts] = useState<IContact[]>([])
  const [newContact, setNewContact] = useState({ name: '', position: '', phone: '', email: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (supplier) {
      setFormData(supplier)
      setContacts(supplier.contacts)
    }
  }, [supplier])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = 'Supplier name is required'
    if (!formData.code) newErrors.code = 'Code is required'
    if (contacts.length === 0) newErrors.contacts = 'At least one contact is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddContact = () => {
    if (newContact.name && newContact.email) {
      setContacts([...contacts, {
        ...newContact,
        id: `contact-${Date.now()}`,
        title: newContact.position,
        role: 'Other' as const,
        isPrimary: false,
      }])
      setNewContact({ name: '', position: '', phone: '', email: '' })
    }
  }

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const dataToSave = { ...formData, contacts } as ISupplier

    if (id && supplier) {
      updateSupplier(id, dataToSave)
    } else {
      dataToSave.id = `supplier-${Date.now()}`
      addSupplier(dataToSave)
    }

    navigate(id ? `/suppliers/${id}` : '/suppliers')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition duration-200"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{id ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</h1>
          <p className="text-gray-600 text-sm mt-1">{id ? 'Cập nhật thông tin nhà cung cấp' : 'Tạo mới nhà cung cấp'}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="pb-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên nhà cung cấp *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Nhập tên nhà cung cấp"
                />
                {errors.name && <p className="text-red-600 text-sm mt-2">⚠️ {errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã NCC *</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors.code ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="NCC-001"
                  />
                  {errors.code && <p className="text-red-600 text-sm mt-2">⚠️ {errors.code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại nhà cung cấp</label>
                  <select
                    value={formData.type || 'Manufacturer'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500"
                  >
                    <option value="Manufacturer">Nhà sản xuất</option>
                    <option value="Trader">Thương nhân</option>
                    <option value="Individual">Cá nhân</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500"
                  >
                    <option value="Active">Hoạt động</option>
                    <option value="Suspended">Tạm ngưng</option>
                    <option value="Blacklisted">Bị chặn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá (0-5)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating || 0}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500"
                    />
                    <div className="text-2xl text-yellow-400">★</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã số thuế</label>
                  <input
                    type="text"
                    value={formData.taxId || ''}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500"
                    placeholder="Mã số thuế"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="pb-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-green-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Điều khoản giao dịch</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lead time (ngày)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.leadTime || 0}
                    onChange={(e) => setFormData({ ...formData, leadTime: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Điều khoản thanh toán</label>
                  <select
                    value={formData.paymentTerms ?? 'NET 30'}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500"
                  >
                    <option value="NET 15">NET 15</option>
                    <option value="NET 30">NET 30</option>
                    <option value="NET 60">NET 60</option>
                    <option value="COD">COD</option>
                    <option value="Prepaid">Trả trước</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá trị đơn hàng tối thiểu (VND)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minOrderValue || 0}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="pb-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Liên hệ *</h2>
            </div>
            {errors.contacts && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">⚠️ {errors.contacts}</div>}

            {contacts.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Danh sách liên hệ ({contacts.length})</h3>
                <div className="space-y-3">
                  {contacts.map((contact, idx) => (
                    <div key={idx} className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent border border-blue-100 rounded-lg hover:border-blue-300 transition">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        {contact.title && <div className="text-sm text-gray-600 mt-1">{contact.title}</div>}
                        <div className="text-sm text-gray-600 mt-2 flex gap-3">
                          {contact.phone && <span>📱 {contact.phone}</span>}
                          {contact.email && <span>✉️ {contact.email}</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(idx)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-dashed border-gray-300 space-y-5">
              <h3 className="text-sm font-semibold text-gray-700">Thêm liên hệ mới</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên liên hệ</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500"
                  placeholder="Nhập tên đầy đủ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                <input
                  type="text"
                  value={newContact.position}
                  onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500"
                  placeholder="VD: Quản lý bán hàng"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500"
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Điện thoại</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition focus:border-blue-500"
                    placeholder="(+84) 901 234 567"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddContact}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={20} />
                Thêm liên hệ
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition duration-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-200 transition duration-200 transform hover:scale-105"
            >
              {id ? '💾 Cập nhật' : '✚ Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
