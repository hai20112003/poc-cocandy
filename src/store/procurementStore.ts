import { create } from 'zustand'
import { ISupplier } from '../features/suppliers/types'
import { IPR } from '../features/purchaseRequest/types'
import { IPO } from '../features/purchaseOrder/types'
import { IGRN, IReturn } from '../features/goodsReceipt/types'
import { mockSuppliers } from '../features/suppliers/mockData'
import { mockPurchaseRequests } from '../features/purchaseRequest/mockData'
import { mockPurchaseOrders } from '../features/purchaseOrder/mockData'
import { mockGoodsReceipts, mockReturns } from '../features/goodsReceipt/mockData'

interface ProcurementStore {
  // Suppliers
  suppliers: ISupplier[]
  addSupplier: (supplier: ISupplier) => void
  updateSupplier: (id: string, data: Partial<ISupplier>) => void
  getSupplier: (id: string) => ISupplier | undefined

  // Purchase Requests
  purchaseRequests: IPR[]
  addPurchaseRequest: (pr: IPR) => void
  updatePurchaseRequest: (id: string, data: Partial<IPR>) => void
  getPurchaseRequest: (id: string) => IPR | undefined

  // Purchase Orders
  purchaseOrders: IPO[]
  addPurchaseOrder: (po: IPO) => void
  updatePurchaseOrder: (id: string, data: Partial<IPO>) => void
  getPurchaseOrder: (id: string) => IPO | undefined

  // Goods Receipts
  goodsReceipts: IGRN[]
  returns: IReturn[]
  addGoodsReceipt: (grn: IGRN) => void
  updateGoodsReceipt: (id: string, data: Partial<IGRN>) => void
  getGoodsReceipt: (id: string) => IGRN | undefined
  addReturn: (ret: IReturn) => void
  updateReturn: (id: string, data: Partial<IReturn>) => void
  getReturn: (id: string) => IReturn | undefined
}

export const useProcurementStore = create<ProcurementStore>((set, get) => ({
  // Initial state
  suppliers: mockSuppliers,
  purchaseRequests: mockPurchaseRequests,
  purchaseOrders: mockPurchaseOrders,
  goodsReceipts: mockGoodsReceipts,
  returns: mockReturns,

  // Suppliers
  addSupplier: (supplier) =>
    set((state) => ({
      suppliers: [...state.suppliers, supplier],
    })),
  updateSupplier: (id, data) =>
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),
  getSupplier: (id) => {
    const state = get()
    return state.suppliers.find((s) => s.id === id)
  },

  // Purchase Requests
  addPurchaseRequest: (pr) =>
    set((state) => ({
      purchaseRequests: [...state.purchaseRequests, pr],
    })),
  updatePurchaseRequest: (id, data) =>
    set((state) => ({
      purchaseRequests: state.purchaseRequests.map((pr) => (pr.id === id ? { ...pr, ...data } : pr)),
    })),
  getPurchaseRequest: (id) => {
    const state = get()
    return state.purchaseRequests.find((pr) => pr.id === id)
  },

  // Purchase Orders
  addPurchaseOrder: (po) =>
    set((state) => ({
      purchaseOrders: [...state.purchaseOrders, po],
    })),
  updatePurchaseOrder: (id, data) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? { ...po, ...data } : po)),
    })),
  getPurchaseOrder: (id) => {
    const state = get()
    return state.purchaseOrders.find((po) => po.id === id)
  },

  // Goods Receipts
  addGoodsReceipt: (grn) =>
    set((state) => ({
      goodsReceipts: [...state.goodsReceipts, grn],
    })),
  updateGoodsReceipt: (id, data) =>
    set((state) => ({
      goodsReceipts: state.goodsReceipts.map((grn) => (grn.id === id ? { ...grn, ...data } : grn)),
    })),
  getGoodsReceipt: (id) => {
    const state = get()
    return state.goodsReceipts.find((grn) => grn.id === id)
  },

  // Returns
  addReturn: (ret) =>
    set((state) => ({
      returns: [...state.returns, ret],
    })),
  updateReturn: (id, data) =>
    set((state) => ({
      returns: state.returns.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),
  getReturn: (id) => {
    const state = get()
    return state.returns.find((r) => r.id === id)
  },
}))
