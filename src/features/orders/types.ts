export type OrderStatus =
  | 'Đã đặt'
  | 'Đang giao'
  | 'Đã về khớp'
  | 'Về một phần'
  | 'Về lệch bill'

export type ProductCategory = 'Thành phẩm' | 'Nguyên phụ liệu'

export interface OrderItem {
  id: string
  productName: string
  productCategory: ProductCategory
  productCode: string
  imageUrl?: string
  orderDate: string        // per-item order date
  quantity: number
  unit: string
  notes?: string
  unitPrice: number
  totalAmount: number      // quantity * unitPrice
  currency: string
}

export interface Order {
  id: string
  supplierId: string
  status: OrderStatus
  items: OrderItem[]
  createdAt: string
}
