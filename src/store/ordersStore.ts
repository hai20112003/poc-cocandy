import { create } from 'zustand'
import { mockOrders } from '@/mock/orders'
import type { Order } from '@/features/orders/types'

interface OrdersState {
  orders: Order[]
  add: (data: Omit<Order, 'id' | 'createdAt'>) => void
  update: (id: string, data: Omit<Order, 'id' | 'createdAt'>) => void
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: mockOrders,
  add: (data) =>
    set((s) => ({
      orders: [
        { ...data, id: `ORD-${String(s.orders.length + 1).padStart(3, '0')}`, createdAt: new Date().toISOString().slice(0, 10) },
        ...s.orders,
      ],
    })),
  update: (id, data) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
    })),
}))
