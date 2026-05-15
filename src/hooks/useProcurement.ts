import { useMemo } from 'react'
import { useProcurementStore } from '@/store/procurementStore'

export function useSuppliers() {
  const suppliers = useProcurementStore((state) => state.suppliers)
  const stats = useMemo(() => ({
    active: suppliers.filter((s) => s.status === 'Active').length,
    suspended: suppliers.filter((s) => s.status === 'Suspended').length,
    blacklisted: suppliers.filter((s) => s.status === 'Blacklisted').length,
    total: suppliers.length,
  }), [suppliers])

  return { suppliers, stats }
}

export function usePurchaseRequests() {
  const purchaseRequests = useProcurementStore((state) => state.purchaseRequests)
  const stats = useMemo(() => ({
    draft: purchaseRequests.filter((pr) => pr.status === 'Draft').length,
    submitted: purchaseRequests.filter((pr) => pr.status === 'Submitted').length,
    approved: purchaseRequests.filter((pr) => pr.status === 'Approved').length,
    rejected: purchaseRequests.filter((pr) => pr.status === 'Rejected').length,
    converted: purchaseRequests.filter((pr) => pr.status === 'Converted').length,
    total: purchaseRequests.length,
  }), [purchaseRequests])

  return { purchaseRequests, stats }
}

export function usePurchaseOrders() {
  const purchaseOrders = useProcurementStore((state) => state.purchaseOrders)
  const stats = useMemo(() => ({
    draft: purchaseOrders.filter((po) => po.status === 'Draft').length,
    sent: purchaseOrders.filter((po) => po.status === 'Sent').length,
    confirmed: purchaseOrders.filter((po) => po.status === 'Confirmed').length,
    receiving: purchaseOrders.filter((po) => po.status === 'Receiving').length,
    completed: purchaseOrders.filter((po) => po.status === 'Completed').length,
    cancelled: purchaseOrders.filter((po) => po.status === 'Cancelled').length,
    total: purchaseOrders.length,
  }), [purchaseOrders])

  return { purchaseOrders, stats }
}

export function useGoodsReceipts() {
  const goodsReceipts = useProcurementStore((state) => state.goodsReceipts)
  const stats = useMemo(() => ({
    draft: goodsReceipts.filter((grn) => grn.status === 'Draft').length,
    submitted: goodsReceipts.filter((grn) => grn.status === 'Submitted').length,
    received: goodsReceipts.filter((grn) => grn.status === 'Received').length,
    qc: goodsReceipts.filter((grn) => grn.status === 'QC In Progress').length,
    completed: goodsReceipts.filter((grn) => grn.status === 'Completed').length,
    rejected: goodsReceipts.filter((grn) => grn.status === 'Rejected').length,
    total: goodsReceipts.length,
  }), [goodsReceipts])

  return { goodsReceipts, stats }
}
