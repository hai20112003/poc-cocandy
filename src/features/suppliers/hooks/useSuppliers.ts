import { useState, useEffect } from 'react'
import { useSuppliersStore } from '@/store/suppliersStore'

export function useSuppliers() {
  const suppliers = useSuppliersStore((s) => s.suppliers)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  return { suppliers, isLoading }
}
