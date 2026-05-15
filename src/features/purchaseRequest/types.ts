export interface IPRItem {
  id: string
  productId: string
  productCategory?: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
  notes: string
  specification?: string
  estimatedPrice?: number
  suggestedSupplier?: string
}

export interface IPR {
  id: string
  code: string
  department: string
  createdBy: string
  supplier?: string
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Converted'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  items: IPRItem[]
  subtotal: number
  tax: number
  total: number
  neededDate: Date
  approver: string
  approvedBy?: string
  approvedAt?: Date
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
  convertedToPOId?: string
  requester?: string
  notes?: string
  overallRating?: number      // 1-5 star rating
  ratingComment?: string      // Optional comment, max 500 chars
}

// Type aliases for backward compatibility
export type IPurchaseRequest = IPR
export type IPurchaseRequestItem = IPRItem

export interface PurchaseRequestsState {
  items: IPR[]
  selected: IPR | null
  filters: {
    status: string
    department: string
    dateRange: [Date | null, Date | null]
    search: string
  }
  loading: boolean
  error: string | null
}
