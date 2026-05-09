export interface Supplier {
  id: string
  name: string
  mccCode: string
  brandIds: string[]
  supplierSourceIds: string[]
  productCategories: string[]   // 'NPL' | 'Thành phẩm'
  qrImageUrl?: string
  nccInfo?: string
}
