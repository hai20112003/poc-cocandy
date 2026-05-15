export interface IContact {
  id: string
  name: string
  title: string
  phone: string
  email: string
  role: 'Primary' | 'Accounting' | 'Logistics' | 'Other'
  isPrimary: boolean
}

export interface IProduct {
  id: string
  name: string
  unit: string
  unitPrice: number
  moq: number
  leadTime: number
  notes: string
}

export interface ISupplier {
  id: string
  code: string
  name: string
  taxId: string
  type: 'Manufacturer' | 'Trader' | 'Individual'
  address: string
  phone: string
  email: string
  leadTime: number
  paymentTerms: 'NET 15' | 'NET 30' | 'NET 60' | 'COD' | 'Prepaid'
  currency: string
  status: 'Active' | 'Suspended' | 'Blacklisted'
  blacklistReason?: string
  rating: number
  contacts: IContact[]
  products: IProduct[]
  createdAt: Date
  updatedAt: Date
}

export interface ISupplierEvaluation {
  id: string
  supplierId: string
  period: string
  qualityScore: number
  deliveryScore: number
  priceScore: number
  serviceScore: number
  totalScore: number
  note: string
  evaluatedBy: string
  createdAt: Date
}

export interface IContract {
  id: string
  supplierId: string
  contractNo: string
  startDate: Date
  endDate: Date
  paymentTerms: string
  discountRate: number
  minOrderValue: number
  status: 'Draft' | 'Active' | 'Expired' | 'Terminated'
  fileUrl?: string
  createdAt: Date
}

export interface SuppliersState {
  items: ISupplier[]
  selected: ISupplier | null
  filters: {
    status: string
    type: string
    search: string
    sortBy: string
  }
  loading: boolean
  error: string | null
}

export type Supplier = ISupplier
