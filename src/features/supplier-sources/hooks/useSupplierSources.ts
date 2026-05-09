import { useState, useEffect } from 'react'
import { useSupplierSourcesStore } from '@/store/supplierSourcesStore'

export function useSupplierSources() {
  const supplierSources = useSupplierSourcesStore((s) => s.supplierSources)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  return { supplierSources, isLoading }
}
