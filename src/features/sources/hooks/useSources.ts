import { useState, useEffect } from 'react'
import { mockSources } from '@/mock/sources'
import type { SupplierSource } from '../types'

export function useSources() {
  const [sources, setSources] = useState<SupplierSource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSources(mockSources)
      setIsLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  return { sources, isLoading }
}
