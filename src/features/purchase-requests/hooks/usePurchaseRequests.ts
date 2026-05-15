import { usePurchaseRequestsStore } from '@/store/purchaseRequestsStore'

export function usePurchaseRequests() {
  const purchaseRequests = usePurchaseRequestsStore((s) => s.purchaseRequests)

  return {
    purchaseRequests,
    isLoading: false,
  }
}
