import { create } from 'zustand'
import { mockBrands } from '@/mock/brands'
import type { Brand } from '@/features/brands/types'

interface BrandsState {
  brands: Brand[]
  add: (data: Omit<Brand, 'id'>) => void
  update: (id: string, data: Omit<Brand, 'id'>) => void
}

export const useBrandsStore = create<BrandsState>((set) => ({
  brands: mockBrands,
  add: (data) =>
    set((s) => ({
      brands: [...s.brands, { ...data, id: `b${Date.now()}` }],
    })),
  update: (id, data) =>
    set((s) => ({
      brands: s.brands.map((b) => (b.id === id ? { ...b, ...data } : b)),
    })),
}))
