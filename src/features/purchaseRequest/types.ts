export interface IPRItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
  notes: string
}

export interface IPR {
  id: string
  code: string
  department: string
  requester: string
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Converted'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  items: IPRItem[]
  subtotal: number
  tax: number
  total: number
  neededByDate: Date
  approver: string
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
  convertedToPOId?: string
}

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
