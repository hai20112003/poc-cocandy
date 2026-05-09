import { useState, useEffect } from 'react'
import { mockSuppliers } from '@/mock/suppliers'
import type { Supplier } from '../types'

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSuppliers(mockSuppliers)
      setIsLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  return { suppliers, isLoading }
}
