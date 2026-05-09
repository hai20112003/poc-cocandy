export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'in_transit'
  | 'delivered'
  | 'overdue'

export interface OrderItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  supplierId: string
  brandId: string
  amount: number
  currency: string
  status: OrderStatus
  createdAt: string
  expectedDate: string
  items: OrderItem[]
}
