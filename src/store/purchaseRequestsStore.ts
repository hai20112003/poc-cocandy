import { create } from 'zustand'
import type { PurchaseRequest } from '@/features/purchase-requests/types'

interface PurchaseRequestsStore {
  purchaseRequests: PurchaseRequest[]
  add: (data: Omit<PurchaseRequest, 'id' | 'createdAt'>) => void
  update: (id: string, data: Partial<PurchaseRequest>) => void
  remove: (id: string) => void
  getById: (id: string) => PurchaseRequest | undefined
}

const generateCode = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `PR-${year}-${month}${day}-${random}`
}

export const usePurchaseRequestsStore = create<PurchaseRequestsStore>((set, get) => ({
  purchaseRequests: [
    {
      id: '1',
      code: 'PR-2026-043',
      department: 'Sản xuất',
      neededDate: '17/05/2026',
      priority: 'high',
      items: [
        {
          id: '1',
          productName: 'Vải Cotton Trắng',
          productCategory: '',
          specification: 'Khổ 150cm, 100% cotton',
          quantity: 200,
          unit: 'mét',
          estimatedPrice: 120000,
          suggestedSupplier: 'Vải ABC Trading',
        },
      ],
      totalEstimated: 24000000,
      status: 'approved',
      createdAt: '12/05/2026',
      createdBy: 'Nguyễn Văn A',
      approvedAt: '12/05/2026',
      approvedBy: 'Trưởng phòng',
    },
    {
      id: '2',
      code: 'PR-2026-042',
      department: 'Kiểm chất lượng',
      neededDate: '19/05/2026',
      priority: 'medium',
      items: [
        {
          id: '1',
          productName: 'Khóa Kéo 20cm',
          productCategory: '',
          specification: 'Màu đen, chất lượng tốt',
          quantity: 500,
          unit: 'cái',
          estimatedPrice: 15000,
          suggestedSupplier: 'Phụ Liệu XYZ',
        },
      ],
      totalEstimated: 7500000,
      status: 'pending',
      createdAt: '11/05/2026',
      createdBy: 'Trần Thị B',
    },
  ],

  add: (data) =>
    set((state) => ({
      purchaseRequests: [
        ...state.purchaseRequests,
        {
          ...data,
          id: Math.random().toString(),
          code: generateCode(),
          createdAt: new Date().toLocaleDateString('vi-VN'),
        },
      ],
    })),

  update: (id, data) =>
    set((state) => ({
      purchaseRequests: state.purchaseRequests.map((pr) => (pr.id === id ? { ...pr, ...data } : pr)),
    })),

  remove: (id) =>
    set((state) => ({
      purchaseRequests: state.purchaseRequests.filter((pr) => pr.id !== id),
    })),

  getById: (id) => {
    const state = get()
    return state.purchaseRequests.find((pr) => pr.id === id)
  },
}))
