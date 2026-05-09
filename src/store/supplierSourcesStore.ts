import { create } from 'zustand'
import { mockSupplierSources } from '@/mock/supplier-sources'
import type { SupplierSource } from '@/features/supplier-sources/types'

interface SupplierSourcesState {
  supplierSources: SupplierSource[]
  add: (data: Omit<SupplierSource, 'id'>) => void
  update: (id: string, data: Omit<SupplierSource, 'id'>) => void
}

export const useSupplierSourcesStore = create<SupplierSourcesState>((set) => ({
  supplierSources: mockSupplierSources,
  add: (data) =>
    set((s) => ({
      supplierSources: [...s.supplierSources, { ...data, id: `ss${Date.now()}` }],
    })),
  update: (id, data) =>
    set((s) => ({
      supplierSources: s.supplierSources.map((ss) => (ss.id === id ? { ...ss, ...data } : ss)),
    })),
}))
