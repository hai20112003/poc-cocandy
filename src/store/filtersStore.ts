import { create } from 'zustand'

interface ModuleFilters {
  search: string
  status: string
}

interface FiltersState {
  orders: ModuleFilters
  suppliers: ModuleFilters
  brands: ModuleFilters
  sources: ModuleFilters
  setFilter: (
    module: 'orders' | 'suppliers' | 'brands' | 'sources',
    filters: Partial<ModuleFilters>
  ) => void
}

export const useFiltersStore = create<FiltersState>((set) => ({
  orders: { search: '', status: 'all' },
  suppliers: { search: '', status: 'all' },
  brands: { search: '', status: 'all' },
  sources: { search: '', status: 'all' },
  setFilter: (module, filters) =>
    set((state) => ({
      [module]: { ...state[module], ...filters },
    })),
}))
