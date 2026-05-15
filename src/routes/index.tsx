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
import { PRDetail } from '@/features/purchaseRequest/pages/PRDetail'
import { PODetail } from '@/features/purchaseOrder/pages/PODetail'
import { GRNDetail } from '@/features/goodsReceipt/pages/GRNDetail'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/brands" replace /> },
      { path: 'brands', element: <BrandsPage /> },
      { path: 'supplier-sources', element: <SupplierSourcesPage /> },
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'suppliers/:id', element: <SupplierDetail /> },
      { path: 'purchase-requests', element: <PurchaseRequestsPage /> },
      { path: 'purchase-requests/:id', element: <PRDetail /> },
      { path: 'goods-receipts', element: <GoodsReceiptsPage /> },
      { path: 'goods-receipts/:id', element: <GRNDetail /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:id', element: <PODetail /> },
      { path: 'sources', element: <SourcesPage /> },
    ],
  },
])
