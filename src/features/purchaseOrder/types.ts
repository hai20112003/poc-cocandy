export interface IPOItem {
  id: string
  prItemId?: string
  productId: string
  productName: string
  quantity: number
  quantityReceived: number
  unit: string
  unitPrice: number
  discountRate: number
  taxRate: number
  total: number
  notes: string
}

export interface IPO {
  id: string
  code: string
  supplierId: string
  supplierName: string
  status: 'Draft' | 'Sent' | 'Confirmed' | 'Receiving' | 'Completed' | 'Cancelled'
  items: IPOItem[]
  subtotal: number
  total: number
  currency: string
  paymentTerms: string
  expectedDeliveryDate: Date
  createdAt: Date
  createdBy: string
  sentAt?: Date
  confirmedAt?: Date
  completedAt?: Date
  relatedPRIds?: string[]
  cancellationReason?: string
}

export interface PurchaseOrdersState {
  items: IPO[]
  selected: IPO | null
  filters: {
    status: string
    supplier: string
    dateRange: [Date | null, Date | null]
    search: string
  }
  loading: boolean
  error: string | null
}
