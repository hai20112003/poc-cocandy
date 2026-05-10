import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Plus, Trash2, ImagePlus } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { OrderStatusBadge } from './OrderStatusBadge'
import { useSuppliersStore } from '@/store/suppliersStore'
import { cn } from '@/utils/cn'
import type { Order, OrderItem, OrderStatus, ProductCategory } from '../types'

interface OrderModalProps {
  open: boolean
  onClose: () => void
  order?: Order | null
  onSave: (data: Omit<Order, 'id' | 'createdAt'>) => void
}

interface DraftItem {
  id: string
  productName: string
  productCategory: ProductCategory | ''
  productCode: string
  imageUrl?: string
  orderDate: string
  quantity: string
  unit: string
  notes: string
  unitPrice: string
  currency: string
}

interface FormErrors {
  supplierId?: string
  items?: string
}

const ORDER_STATUSES: OrderStatus[] = ['Đã đặt', 'Đang giao', 'Đã về khớp', 'Về một phần', 'Về lệch bill']
const PRODUCT_CATEGORIES: ProductCategory[] = ['Thành phẩm', 'Nguyên phụ liệu']
const CURRENCIES = ['VND', 'USD', 'EUR', 'CNY']
const UNITS = ['cái', 'đôi', 'kg', 'm', 'cuộn', 'thùng', 'bộ', 'lô', 'set', 'chiếc']

const LBL = 'block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1'
const FIELD = cn(
  'w-full px-3 py-2 text-[12px] rounded-lg border bg-white dark:bg-slate-800',
  'text-slate-900 dark:text-white placeholder-slate-400',
  'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all'
)
const OK = 'border-slate-200 dark:border-slate-700'
const ERR = 'border-red-400 dark:border-red-600'
const READONLY = 'bg-slate-50 dark:bg-slate-900 text-slate-400 cursor-not-allowed'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function newItem(): DraftItem {
  return {
    id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    productName: '',
    productCategory: '',
    productCode: '',
    orderDate: today(),
    quantity: '',
    unit: 'cái',
    notes: '',
    unitPrice: '',
    currency: 'VND',
  }
}

function itemToForm(item: OrderItem): DraftItem {
  return {
    id: item.id,
    productName: item.productName,
    productCategory: item.productCategory,
    productCode: item.productCode,
    imageUrl: item.imageUrl,
    orderDate: item.orderDate,
    quantity: String(item.quantity),
    unit: item.unit,
    notes: item.notes ?? '',
    unitPrice: String(item.unitPrice),
    currency: item.currency,
  }
}

function calcTotal(item: DraftItem): number {
  return (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
}

export function OrderModal({ open, onClose, order, onSave }: OrderModalProps) {
  const suppliers = useSuppliersStore((s) => s.suppliers)

  const [supplierId, setSupplierId] = useState('')
  const [status, setStatus] = useState<OrderStatus>('Đã đặt')
  const [items, setItems] = useState<DraftItem[]>([newItem()])
  const [errors, setErrors] = useState<FormErrors>({})
  const [invalidIds, setInvalidIds] = useState<Set<string>>(new Set())

  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeRowRef = useRef<string | null>(null)

  useEffect(() => {
    if (!open) return
    setSupplierId(order?.supplierId ?? '')
    setStatus(order?.status ?? 'Đã đặt')
    setItems(order?.items.length ? order.items.map(itemToForm) : [newItem()])
    setErrors({})
    setInvalidIds(new Set())
  }, [open, order])

  const updateItem = useCallback((id: string, patch: Partial<DraftItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
    setInvalidIds((prev) => { const next = new Set(prev); next.delete(id); return next })
  }, [])

  function addItem() {
    setItems((prev) => [...prev, newItem()])
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  function triggerImageUpload(rowId: string) {
    activeRowRef.current = rowId
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !activeRowRef.current) return
    const rowId = activeRowRef.current
    const reader = new FileReader()
    reader.onload = (ev) => updateItem(rowId, { imageUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
    e.target.value = ''
    activeRowRef.current = null
  }

  function validate(): boolean {
    const errs: FormErrors = {}
    if (!supplierId) errs.supplierId = 'Vui lòng chọn nhà cung cấp'
    if (items.length === 0) errs.items = 'Cần ít nhất một mặt hàng'

    const invalid = new Set<string>()
    items.forEach((item) => {
      if (
        !item.productName.trim() ||
        !item.productCode.trim() ||
        !item.productCategory ||
        !item.orderDate ||
        !item.quantity || parseFloat(item.quantity) <= 0 ||
        !item.unit ||
        item.unitPrice === '' || parseFloat(item.unitPrice) < 0
      ) {
        invalid.add(item.id)
      }
    })
    setInvalidIds(invalid)
    if (invalid.size > 0) errs.items = 'Vui lòng điền đầy đủ thông tin các mặt hàng có (*)'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({
      supplierId,
      status,
      items: items.map((draft, i) => ({
        id: draft.id.startsWith('tmp-') ? `item-${Date.now()}-${i}` : draft.id,
        productName: draft.productName.trim(),
        productCategory: draft.productCategory as ProductCategory,
        productCode: draft.productCode.trim(),
        imageUrl: draft.imageUrl,
        orderDate: draft.orderDate,
        quantity: Number(draft.quantity),
        unit: draft.unit,
        notes: draft.notes.trim() || undefined,
        unitPrice: Number(draft.unitPrice),
        totalAmount: calcTotal(draft),
        currency: draft.currency,
      })),
    })
    onClose()
  }

  const grandTotals = useMemo(
    () =>
      items.reduce((acc, item) => {
        const t = calcTotal(item)
        if (t > 0) acc[item.currency] = (acc[item.currency] ?? 0) + t
        return acc
      }, {} as Record<string, number>),
    [items]
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={order ? 'Chi tiết đơn hàng' : 'Tạo đơn hàng mới'}
      className="max-w-2xl"
    >
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <div className="max-h-[78vh] overflow-y-auto -mx-5 px-5 space-y-4">

        {/* ── Header ─────────────────────────────────────── */}

        {/* Status strip — edit mode */}
        {order && (
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium text-slate-500">Trạng thái</span>
              <OrderStatusBadge status={status} />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="text-[11px] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <span className="font-mono text-[10px] font-bold text-indigo-500 dark:text-indigo-400 shrink-0">
              {order.id}
            </span>
          </div>
        )}

        {/* Nhà cung cấp */}
        <div>
          <label className={LBL}>Nhà cung cấp <span className="text-red-500">*</span></label>
          <select
            value={supplierId}
            autoFocus
            onChange={(e) => { setSupplierId(e.target.value); setErrors((p) => ({ ...p, supplierId: undefined })) }}
            className={cn(FIELD, errors.supplierId ? ERR : OK)}
          >
            <option value="">— Chọn nhà cung cấp —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.mccCode} — {s.name}</option>
            ))}
          </select>
          {errors.supplierId && <p className="mt-1 text-[10px] text-red-500">{errors.supplierId}</p>}
        </div>

        {/* Trạng thái + Mã đơn — create mode */}
        {!order && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LBL}>Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className={cn(FIELD, OK)}
              >
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={LBL}>Mã đơn</label>
              <input
                disabled
                placeholder="Tự động tạo"
                className={cn(FIELD, OK, READONLY, 'font-mono')}
              />
            </div>
          </div>
        )}

        {/* ── Items ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                Danh sách hàng hóa
              </span>
              <span className="ml-2 text-[10px] text-slate-400">
                {items.length} mặt hàng
              </span>
            </div>
          </div>

          {errors.items && (
            <p className="mb-2 text-[10px] text-red-500">{errors.items}</p>
          )}

          <div className="space-y-3">
            {items.map((item, idx) => {
              const bad = invalidIds.has(item.id)
              const rowTotal = calcTotal(item)
              return (
                <div
                  key={item.id}
                  className={cn(
                    'rounded-xl border p-4 space-y-3 transition-colors',
                    bad
                      ? 'border-red-300 dark:border-red-700/60 bg-red-50/30 dark:bg-red-950/10'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20'
                  )}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Mặt hàng {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Xóa mặt hàng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Row 1: Tên hàng | Loại hàng | Mã hàng */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className={LBL}>Tên hàng <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => updateItem(item.id, { productName: e.target.value })}
                        placeholder="Tên sản phẩm"
                        className={cn(FIELD, bad && !item.productName.trim() ? ERR : OK)}
                      />
                    </div>
                    <div>
                      <label className={LBL}>Loại hàng <span className="text-red-500">*</span></label>
                      <select
                        value={item.productCategory}
                        onChange={(e) => updateItem(item.id, { productCategory: e.target.value as ProductCategory | '' })}
                        className={cn(FIELD, bad && !item.productCategory ? ERR : OK)}
                      >
                        <option value="">— Chọn —</option>
                        {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={LBL}>Mã hàng <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={item.productCode}
                        onChange={(e) => updateItem(item.id, { productCode: e.target.value })}
                        placeholder="NK-AM270"
                        className={cn(FIELD, 'font-mono', bad && !item.productCode.trim() ? ERR : OK)}
                      />
                    </div>
                  </div>

                  {/* Row 2: Ngày đặt | Số lượng | Đơn vị */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className={LBL}>Ngày đặt <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={item.orderDate}
                        onChange={(e) => updateItem(item.id, { orderDate: e.target.value })}
                        className={cn(FIELD, bad && !item.orderDate ? ERR : OK)}
                      />
                    </div>
                    <div>
                      <label className={LBL}>Số lượng <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: e.target.value })}
                        placeholder="0"
                        className={cn(FIELD, bad && (!item.quantity || parseFloat(item.quantity) <= 0) ? ERR : OK)}
                      />
                    </div>
                    <div>
                      <label className={LBL}>Đơn vị <span className="text-red-500">*</span></label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                        className={cn(FIELD, bad && !item.unit ? ERR : OK)}
                      >
                        <option value="">—</option>
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Đơn giá | Tiền tệ | Tổng tiền */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className={LBL}>Đơn giá <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, { unitPrice: e.target.value })}
                        placeholder="0"
                        className={cn(FIELD, bad && item.unitPrice === '' ? ERR : OK)}
                      />
                    </div>
                    <div>
                      <label className={LBL}>Tiền tệ</label>
                      <select
                        value={item.currency}
                        onChange={(e) => updateItem(item.id, { currency: e.target.value })}
                        className={cn(FIELD, OK)}
                      >
                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={LBL}>Tổng tiền</label>
                      <div className={cn(FIELD, OK, READONLY, 'flex items-center justify-end font-semibold tabular-nums')}>
                        {rowTotal > 0 ? (
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {rowTotal.toLocaleString('vi-VN')}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Ghi chú | Ảnh mẫu */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className={LBL}>Ghi chú</label>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                        placeholder="Màu sắc, kích thước, yêu cầu đặc biệt..."
                        className={cn(FIELD, OK)}
                      />
                    </div>
                    <div>
                      <label className={LBL}>Ảnh mẫu</label>
                      {item.imageUrl ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0"
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => triggerImageUpload(item.id)}
                              className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline text-left"
                            >
                              Thay đổi
                            </button>
                            <button
                              type="button"
                              onClick={() => updateItem(item.id, { imageUrl: undefined })}
                              className="text-[10px] font-medium text-red-500 hover:underline text-left"
                            >
                              Xóa ảnh
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => triggerImageUpload(item.id)}
                          className={cn(
                            FIELD, OK,
                            'flex items-center justify-center gap-2 text-slate-400 cursor-pointer',
                            'hover:text-indigo-500 hover:border-indigo-400 transition-colors'
                          )}
                        >
                          <ImagePlus className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Tải ảnh lên</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add item */}
            <button
              type="button"
              onClick={addItem}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 hover:text-indigo-500 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm mặt hàng
            </button>
          </div>

          {/* Grand total */}
          {Object.keys(grandTotals).length > 0 && (
            <div className="flex items-start justify-end gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-0.5">Tổng cộng</span>
              <div className="text-right space-y-1">
                {Object.entries(grandTotals).map(([currency, amount]) => (
                  <div key={currency} className="flex items-baseline gap-1.5 justify-end">
                    <span className="text-[14px] font-bold text-slate-900 dark:text-white tabular-nums">
                      {amount.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-[10px] font-normal text-slate-400">{currency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-1" />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-[12px] font-medium border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 text-[12px] font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
        >
          Lưu đơn hàng
        </button>
      </div>
    </Modal>
  )
}
