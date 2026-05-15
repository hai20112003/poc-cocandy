import { useGoodsReceiptsStore } from '@/store/goodsReceiptsStore'

export function useGoodsReceipts() {
  const goodsReceipts = useGoodsReceiptsStore((s) => s.goodsReceipts)
  const invoices = useGoodsReceiptsStore((s) => s.invoices)

  return {
    goodsReceipts,
    invoices,
    isLoading: false,
  }
}
