import { useState, useEffect, useMemo } from 'react'
import { mockOrders } from '@/mock/orders'
import type { Order } from '../types'

interface UseOrdersOptions {
  search?: string
  status?: string
}

export function useOrders({ search = '', status = 'all' }: UseOrdersOptions = {}) {
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAllOrders(mockOrders)
      setIsLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  const orders = useMemo(() => {
    return allOrders.filter((o) => {
      const matchesStatus = status === 'all' || o.status === status
      const matchesSearch =
        !search ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.supplierId.toLowerCase().includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [allOrders, search, status])

  return { orders, isLoading, total: allOrders.length }
}
