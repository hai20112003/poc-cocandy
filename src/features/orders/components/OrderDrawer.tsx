import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { OrderStatusBadge } from './OrderStatusBadge'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { mockSuppliers } from '@/mock/suppliers'
import { mockBrands } from '@/mock/brands'
import type { Order } from '../types'

const SUPPLIER_MAP = Object.fromEntries(mockSuppliers.map((s) => [s.id, s.name]))
const BRAND_MAP = Object.fromEntries(mockBrands.map((b) => [b.id, b.name]))

interface OrderDrawerProps {
  order: Order | null
  open: boolean
  onClose: () => void
}

export function OrderDrawer({ order, open, onClose }: OrderDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        {order && (
          <>
            <SheetHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <SheetTitle className="text-indigo-600 dark:text-indigo-400 font-mono">
                  {order.id}
                </SheetTitle>
                <OrderStatusBadge status={order.status} />
              </div>
            </SheetHeader>

            <div className="mt-5 space-y-5">
              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Supplier
                  </p>
                  <p className="text-[12px] text-slate-800 dark:text-slate-200">
                    {SUPPLIER_MAP[order.supplierId] ?? order.supplierId}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Brand
                  </p>
                  <p className="text-[12px] text-slate-800 dark:text-slate-200">
                    {BRAND_MAP[order.brandId] ?? order.brandId}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Amount
                  </p>
                  <p className="text-[16px] font-bold text-slate-900 dark:text-white">
                    {formatCurrency(order.amount, order.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Expected
                  </p>
                  <p className="text-[12px] text-slate-800 dark:text-slate-200">
                    {formatDate(order.expectedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Created
                  </p>
                  <p className="text-[12px] text-slate-800 dark:text-slate-200">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Currency
                  </p>
                  <p className="text-[12px] text-slate-800 dark:text-slate-200">{order.currency}</p>
                </div>
              </div>

              {/* Line items */}
              {order.items.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Line Items ({order.items.length})
                  </p>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                          <th className="px-3 py-2 text-left text-slate-500 font-semibold text-[10px]">
                            Product
                          </th>
                          <th className="px-3 py-2 text-right text-slate-500 font-semibold text-[10px]">
                            Qty
                          </th>
                          <th className="px-3 py-2 text-right text-slate-500 font-semibold text-[10px]">
                            Unit Price
                          </th>
                          <th className="px-3 py-2 text-right text-slate-500 font-semibold text-[10px]">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                          >
                            <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                              {item.productName}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-500">{item.quantity}</td>
                            <td className="px-3 py-2 text-right text-slate-500">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-slate-800 dark:text-slate-200">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
