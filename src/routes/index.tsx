import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { OrdersPage } from '@/features/orders/OrdersPage'
import { SuppliersPage } from '@/features/suppliers/SuppliersPage'
import { SupplierSourcesPage } from '@/features/supplier-sources/SupplierSourcesPage'
import { BrandsPage } from '@/features/brands/BrandsPage'
import { SourcesPage } from '@/features/sources/SourcesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/brands" replace /> },
      { path: 'brands', element: <BrandsPage /> },
      { path: 'supplier-sources', element: <SupplierSourcesPage /> },
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'sources', element: <SourcesPage /> },
    ],
  },
])
