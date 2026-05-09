import { useState, useEffect } from 'react'
import { useBrandsStore } from '@/store/brandsStore'

export function useBrands() {
  const brands = useBrandsStore((s) => s.brands)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  return { brands, isLoading }
}
