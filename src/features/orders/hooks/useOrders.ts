import { useState, useEffect } from 'react'
import { useOrdersStore } from '@/store/ordersStore'

export function useOrders() {
  const orders = useOrdersStore((s) => s.orders)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  return { orders, isLoading }
}
