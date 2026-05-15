import { create } from 'zustand'
import type { GoodsReceipt, Invoice } from '@/features/goods-receipts/types'

interface GoodsReceiptsStore {
  goodsReceipts: GoodsReceipt[]
  invoices: Invoice[]
  addGRN: (data: Omit<GoodsReceipt, 'id' | 'createdAt'>) => void
  updateGRN: (id: string, data: Partial<GoodsReceipt>) => void
  getGRNById: (id: string) => GoodsReceipt | undefined
  addInvoice: (data: Omit<Invoice, 'id' | 'createdAt'>) => void
  updateInvoice: (id: string, data: Partial<Invoice>) => void
  getInvoiceById: (id: string) => Invoice | undefined
}

const generateGRNCode = () => {
  const date = new Date()
  const year = date.getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `GRN-${year}-${random}`
}

const generateInvoiceCode = () => {
  const date = new Date()
  const year = date.getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}-${random}`
}

export const useGoodsReceiptsStore = create<GoodsReceiptsStore>((set, get) => ({
  goodsReceipts: [
    {
      id: '1',
      code: 'GRN-2026-014',
      poCode: 'PO-2026-028',
      supplierName: 'Vải ABC Trading Co.',
      receiveDate: '13/05/2026',
      receivedBy: 'Minh Khoa',
      transportationUnit: 'Giao Hàng Nhanh',
      trackingNumber: 'GHN-20260513-7821',
      items: [
        {
          id: '1',
          productName: 'Vải Cotton Trắng',
          specification: 'Khổ 150cm, 100% cotton',
          orderedQuantity: 200,
          receivedQuantity: 200,
          acceptedQuantity: 200,
          rejectedQuantity: 0,
          unit: 'mét',
          unitPrice: 120000,
          lotNumber: 'LOT-05132',
          warehouseLocation: 'A2-04',
          qcNote: '✓ Đạt toàn bộ',
        },
        {
          id: '2',
          productName: 'Vải Cotton Xanh Navy',
          specification: 'Khổ 150cm, nhuộm navy',
          orderedQuantity: 120,
          receivedQuantity: 0,
          acceptedQuantity: 0,
          rejectedQuantity: 0,
          unit: 'mét',
          unitPrice: 135000,
          lotNumber: '—',
          warehouseLocation: '—',
          qcNote: '⏳ Chưa giao — sẽ nhận GRN#2',
        },
        {
          id: '3',
          productName: 'Vải Cotton Đỏ Đô',
          specification: 'Khổ 150cm, nhuộm đỏ',
          orderedQuantity: 50,
          receivedQuantity: 48,
          acceptedQuantity: 46,
          rejectedQuantity: 2,
          unit: 'mét',
          unitPrice: 140000,
          lotNumber: 'LOT-05134',
          warehouseLocation: 'A2-06',
          qcNote: '⚠ 2m phai màu → Return · 4m NCC giao bù GRN#2',
        },
      ],
      totalReceived: 248,
      totalAccepted: 246,
      totalRejected: 2,
      qcStatus: 'passed',
      status: 'confirmed',
      createdAt: '13/05/2026',
      notes: 'Hàng giao đúng hẹn, đóng gói tốt',
    },
    {
      id: '2',
      code: 'GRN-2026-021',
      poCode: 'PO-2026-028',
      supplierName: 'Vải ABC Trading Co.',
      receiveDate: '18/05/2026',
      receivedBy: '—',
      items: [
        {
          id: '1',
          productName: 'Vải Cotton Trắng',
          specification: 'Khổ 150cm, 100% cotton',
          orderedQuantity: 0,
          receivedQuantity: 0,
          acceptedQuantity: 0,
          rejectedQuantity: 0,
          unit: 'mét',
          unitPrice: 120000,
          lotNumber: '—',
          warehouseLocation: '—',
          qcNote: '✓ Đã nhận đủ ở GRN#1',
        },
        {
          id: '2',
          productName: 'Vải Cotton Xanh Navy',
          specification: 'Khổ 150cm, nhuộm navy',
          orderedQuantity: 120,
          receivedQuantity: 120,
          acceptedQuantity: 120,
          rejectedQuantity: 0,
          unit: 'mét',
          unitPrice: 135000,
          lotNumber: 'LOT-05188',
          warehouseLocation: 'A2-05',
          qcNote: '✓ Đạt — chờ xác nhận',
        },
        {
          id: '3',
          productName: 'Vải Cotton Đỏ Đô (bù 2m lỗi + 2m thiếu)',
          specification: 'Khổ 150cm, nhuộm đỏ',
          orderedQuantity: 4,
          receivedQuantity: 4,
          acceptedQuantity: 4,
          rejectedQuantity: 0,
          unit: 'mét',
          unitPrice: 140000,
          lotNumber: 'LOT-05189',
          warehouseLocation: 'A2-06',
          qcNote: 'Kiểm tra màu kỹ — lô trước phai',
        },
      ],
      totalReceived: 124,
      totalAccepted: 124,
      totalRejected: 0,
      qcStatus: 'pending',
      status: 'draft',
      createdAt: '18/05/2026',
    },
  ],

  invoices: [
    {
      id: '1',
      code: 'INV-2026-001',
      poCode: 'PO-2026-028',
      grnCodes: ['GRN-2026-014'],
      supplierName: 'Vải ABC Trading Co.',
      invoiceDate: '15/05/2026',
      dueDate: '12/06/2026',
      items: [
        {
          id: '1',
          productName: 'Vải Cotton Trắng',
          quantity: 200,
          unit: 'mét',
          unitPrice: 120000,
          totalAmount: 24000000,
        },
        {
          id: '2',
          productName: 'Vải Cotton Đỏ Đô',
          quantity: 46,
          unit: 'mét',
          unitPrice: 140000,
          totalAmount: 6440000,
        },
      ],
      subtotal: 30440000,
      vat: 3044000,
      discount: 1000000,
      total: 32484000,
      paymentTerms: 'NET30',
      status: 'pending',
      createdAt: '15/05/2026',
    },
  ],

  addGRN: (data) =>
    set((state) => ({
      goodsReceipts: [
        ...state.goodsReceipts,
        {
          ...data,
          id: Math.random().toString(),
          code: generateGRNCode(),
          createdAt: new Date().toLocaleDateString('vi-VN'),
        },
      ],
    })),

  updateGRN: (id, data) =>
    set((state) => ({
      goodsReceipts: state.goodsReceipts.map((grn) => (grn.id === id ? { ...grn, ...data } : grn)),
    })),

  getGRNById: (id) => {
    const state = get()
    return state.goodsReceipts.find((grn) => grn.id === id)
  },

  addInvoice: (data) =>
    set((state) => ({
      invoices: [
        ...state.invoices,
        {
          ...data,
          id: Math.random().toString(),
          code: generateInvoiceCode(),
          createdAt: new Date().toLocaleDateString('vi-VN'),
        },
      ],
    })),

  updateInvoice: (id, data) =>
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, ...data } : inv)),
    })),

  getInvoiceById: (id) => {
    const state = get()
    return state.invoices.find((inv) => inv.id === id)
  },
}))
