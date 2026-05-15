export interface PurchaseRequestItem {
  id: string
  productName: string
  specification: string
  quantity: number
  unit: string
  estimatedPrice: number
  suggestedSupplier?: string
}

export interface PurchaseRequest {
  id: string
  code: string
  department: string
  neededDate: string
  priority: 'low' | 'medium' | 'high'
  items: PurchaseRequestItem[]
  totalEstimated: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  createdAt: string
  createdBy: string
  approvedAt?: string
  approvedBy?: string
  notes?: string
}
