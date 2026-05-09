import { create } from 'zustand'
import { mockMccSuppliers } from '@/mock/mcc-suppliers'
import type { Supplier } from '@/features/suppliers/types'

interface SuppliersState {
  suppliers: Supplier[]
  add: (data: Omit<Supplier, 'id'>) => void
  update: (id: string, data: Omit<Supplier, 'id'>) => void
}

export const useSuppliersStore = create<SuppliersState>((set) => ({
  suppliers: mockMccSuppliers,
  add: (data) =>
    set((s) => ({
      suppliers: [...s.suppliers, { ...data, id: `mcc${Date.now()}` }],
    })),
  update: (id, data) =>
    set((s) => ({
      suppliers: s.suppliers.map((sup) => (sup.id === id ? { ...sup, ...data } : sup)),
    })),
}))
