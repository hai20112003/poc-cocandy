export interface IGRNItem {
  id: string
  productId: string
  productName: string
  expectedQty: number
  receivedQty: number
  unit: string
  qcStatus: 'Pass' | 'Fail' | 'Pending'
  batchNo?: string
  expiryDate?: Date
  storageLocation?: string
  notes: string
}

export interface IGRN {
  id: string
  code: string
  poId: string
  prId?: string
  supplierId: string
  supplierName: string
  status: 'Draft' | 'Submitted' | 'Received' | 'QC In Progress' | 'Completed' | 'Rejected'
  isPartial: boolean
  items: IGRNItem[]
  receivedDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface IReturn {
  id: string
  grnId: string
  returnDate: Date
  reason: 'wrong_item' | 'damaged' | 'quality_fail' | 'over_delivery'
  items: IReturnItem[]
  status: 'pending' | 'in_transit' | 'completed' | 'credited'
  creditNoteNo?: string
}

export interface IReturnItem {
  productId: string
  productName: string
  returnQty: number
  unit: string
}

export interface GoodsReceiptsState {
  items: IGRN[]
  selected: IGRN | null
  returns: IReturn[]
  filters: {
    status: string
    supplier: string
    qcStatus: string
    dateRange: [Date | null, Date | null]
    search: string
  }
  loading: boolean
  error: string | null
}
