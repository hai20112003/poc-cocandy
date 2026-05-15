import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, Edit, Plus, Phone, Mail, MapPin, Package } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'
import { ISupplier } from '../types'

export function SupplierDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'products' | 'orders'>('overview')
  const supplier = useProcurementStore((state) => state.getSupplier(id || ''))

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
        <div className="flex border-b border-gray-200">
          {(['overview', 'contacts', 'products', 'orders'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Code</div>
                      <div className="text-gray-900">{supplier.code}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Business Registration</div>
                      <div className="text-gray-900">{supplier.businessRegistration || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Website</div>
                      <div className="text-blue-600">{supplier.website || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Lead Time</div>
                      <div className="text-gray-900">{supplier.leadTime} days</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Payment Terms</div>
                      <div className="text-gray-900">{supplier.paymentTerms} days</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Min Order Value</div>
                      <div className="text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                          supplier.minOrderValue
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus size={18} />
                  Add Contact
                </button>
              </div>
              <div className="space-y-3">
                {supplier.contacts.map((contact) => (
                  <div key={contact.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{contact.position}</div>
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
                <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus size={18} />
                  Add Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Product Name</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">SKU</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Unit Price</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 text-gray-600">{product.sku}</td>
                        <td className="px-6 py-4 text-gray-600">{product.category}</td>
                        <td className="px-6 py-4 text-gray-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-gray-900">{product.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Purchase Orders</h3>
              <div className="text-center py-8 text-gray-600">
                <Package size={40} className="mx-auto mb-2 text-gray-400" />
                <p>No orders yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
