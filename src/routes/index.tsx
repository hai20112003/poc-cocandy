import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { OrdersPage } from '@/features/orders/OrdersPage'
import { SuppliersPage } from '@/features/suppliers/SuppliersPage'
import { SupplierSourcesPage } from '@/features/supplier-sources/SupplierSourcesPage'
import { BrandsPage } from '@/features/brands/BrandsPage'
import { SourcesPage } from '@/features/sources/SourcesPage'
import { PurchaseRequestsPage } from '@/features/purchase-requests/PurchaseRequestsPage'
import { GoodsReceiptsPage } from '@/features/goods-receipts/GoodsReceiptsPage'
import { SupplierDetail } from '@/features/suppliers/pages/SupplierDetail'
import { SupplierForm } from '@/features/suppliers/pages/SupplierForm'
import { PRDetail } from '@/features/purchaseRequest/pages/PRDetail'
import { PRForm } from '@/features/purchaseRequest/pages/PRForm'
import { PODetail } from '@/features/purchaseOrder/pages/PODetail'
import { POForm } from '@/features/purchaseOrder/pages/POForm'
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
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'suppliers/add', element: <SupplierForm /> },
      { path: 'suppliers/:id', element: <SupplierDetail /> },
      { path: 'suppliers/:id/edit', element: <SupplierForm /> },
      { path: 'purchase-requests', element: <PurchaseRequestsPage /> },
      { path: 'purchase-requests/add', element: <PRForm /> },
      { path: 'purchase-requests/:id', element: <PRDetail /> },
      { path: 'purchase-requests/:id/edit', element: <PRForm /> },
      { path: 'goods-receipts', element: <GoodsReceiptsPage /> },
      { path: 'goods-receipts/add', element: <GRNForm /> },
      { path: 'goods-receipts/:id', element: <GRNDetail /> },
      { path: 'goods-receipts/:id/edit', element: <GRNForm /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/add', element: <POForm /> },
      { path: 'orders/:id', element: <PODetail /> },
      { path: 'orders/:id/edit', element: <POForm /> },
      { path: 'sources', element: <SourcesPage /> },
    ],
  },
])
