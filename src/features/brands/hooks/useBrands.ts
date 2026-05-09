import { useState, useEffect } from 'react'
import { mockBrands } from '@/mock/brands'
import type { Brand } from '../types'

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setBrands(mockBrands)
      setIsLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  return { brands, isLoading }
}
