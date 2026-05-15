import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { SupplierList } from '@/features/suppliers/pages/SupplierList'
import { SupplierSourcesPage } from '@/features/supplier-sources/SupplierSourcesPage'
import { BrandsPage } from '@/features/brands/BrandsPage'
import { SourcesPage } from '@/features/sources/SourcesPage'
import { SupplierDetail } from '@/features/suppliers/pages/SupplierDetail'
import { SupplierForm } from '@/features/suppliers/pages/SupplierForm'
import { PRList } from '@/features/purchaseRequest/pages/PRList'
import { PRDetail } from '@/features/purchaseRequest/pages/PRDetail'
import { PRForm } from '@/features/purchaseRequest/pages/PRForm'
import { POList } from '@/features/purchaseOrder/pages/POList'
import { PODetail } from '@/features/purchaseOrder/pages/PODetail'
import { POForm } from '@/features/purchaseOrder/pages/POForm'
import { GRNList } from '@/features/goodsReceipt/pages/GRNList'
import { GRNDetail } from '@/features/goodsReceipt/pages/GRNDetail'
import { GRNForm } from '@/features/goodsReceipt/pages/GRNForm'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/brands" replace /> },
      { path: 'brands', element: <BrandsPage /> },
      { path: 'supplier-sources', element: <SupplierSourcesPage /> },
      { path: 'suppliers', element: <SupplierList /> },
      { path: 'suppliers/add', element: <SupplierForm /> },
      { path: 'suppliers/:id', element: <SupplierDetail /> },
      { path: 'suppliers/:id/edit', element: <SupplierForm /> },
      { path: 'purchase-requests', element: <PRList /> },
      { path: 'purchase-requests/add', element: <PRForm /> },
      { path: 'purchase-requests/:id', element: <PRDetail /> },
      { path: 'purchase-requests/:id/edit', element: <PRForm /> },
      { path: 'goods-receipts', element: <GRNList /> },
      { path: 'goods-receipts/add', element: <GRNForm /> },
      { path: 'goods-receipts/:id', element: <GRNDetail /> },
      { path: 'goods-receipts/:id/edit', element: <GRNForm /> },
      { path: 'orders', element: <POList /> },
      { path: 'orders/add', element: <POForm /> },
      { path: 'orders/:id', element: <PODetail /> },
      { path: 'orders/:id/edit', element: <POForm /> },
      { path: 'sources', element: <SourcesPage /> },
    ],
  },
])
