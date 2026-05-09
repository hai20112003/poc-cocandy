import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { OrdersPage } from '@/features/orders/OrdersPage'
import { SuppliersPage } from '@/features/suppliers/SuppliersPage'
import { BrandsPage } from '@/features/brands/BrandsPage'
import { SourcesPage } from '@/features/sources/SourcesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/orders" replace /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'brands', element: <BrandsPage /> },
      { path: 'sources', element: <SourcesPage /> },
    ],
  },
])
