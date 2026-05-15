export interface GRNItem {
  id: string
  productName: string
  specification: string
  orderedQuantity: number
  receivedQuantity: number
  acceptedQuantity: number
  rejectedQuantity: number
  unit: string
  unitPrice: number
  lotNumber: string
  warehouseLocation: string
  qcNote?: string
}

export interface GoodsReceipt {
  id: string
  code: string
  poCode: string
  supplierName: string
  receiveDate: string
  receivedBy: string
  transportationUnit?: string
  trackingNumber?: string
  items: GRNItem[]
  totalReceived: number
  totalAccepted: number
  totalRejected: number
  qcStatus: 'pending' | 'passed' | 'failed'
  status: 'draft' | 'received' | 'confirmed'
  createdAt: string
  notes?: string
}

export interface Invoice {
  id: string
  code: string
  poCode: string
  grnCodes: string[]
  supplierName: string
  invoiceDate: string
  dueDate: string
  items: {
    id: string
    productName: string
    quantity: number
    unit: string
    unitPrice: number
    totalAmount: number
  }[]
  subtotal: number
  vat: number
  discount: number
  total: number
  paid?: number
  paidDate?: string
  paymentTerms: string
  status: 'pending' | 'partial' | 'paid'
  notes?: string
  createdAt: string
}
