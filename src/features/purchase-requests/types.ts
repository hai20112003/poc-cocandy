export interface PurchaseRequestItem {
  id: string
  /** Product category. Should be either 'Nguyên phụ liệu' (Raw Materials) or 'Thành phẩm' (Finished Products) */
  productCategory: string
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
