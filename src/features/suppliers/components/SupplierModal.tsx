import { useState, useEffect, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { MultiSelect } from '@/components/shared/MultiSelect'
import { useBrandsStore } from '@/store/brandsStore'
import { useSupplierSourcesStore } from '@/store/supplierSourcesStore'
import { cn } from '@/utils/cn'
import type { Supplier } from '../types'

interface SupplierModalProps {
  open: boolean
  onClose: () => void
  supplier?: Supplier | null
  onSave: (data: Omit<Supplier, 'id'>) => void
}

interface FormErrors {
  name?: string
  mccCode?: string
  brandIds?: string
  supplierSourceIds?: string
  productCategories?: string
}

const PRODUCT_CATEGORIES = ['NPL', 'Thành phẩm'] as const

const LABEL = 'block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1.5'
const INPUT = cn(
  'w-full px-3 py-2 text-[12px] rounded-lg border bg-white dark:bg-slate-800',
  'text-slate-900 dark:text-white placeholder-slate-400',
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow'
)

export function SupplierModal({ open, onClose, supplier, onSave }: SupplierModalProps) {
  const brands = useBrandsStore((s) => s.brands)
  const supplierSources = useSupplierSourcesStore((s) => s.supplierSources)

  const [name, setName] = useState('')
  const [mccCode, setMccCode] = useState('')
  const [brandIds, setBrandIds] = useState<string[]>([])
  const [supplierSourceIds, setSupplierSourceIds] = useState<string[]>([])
  const [productCategories, setProductCategories] = useState<string[]>([])
  const [qrImageUrl, setQrImageUrl] = useState<string | undefined>()
  const [nccInfo, setNccInfo] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(supplier?.name ?? '')
      setErrors({})
    }
  }, [open, supplier])

  function validate(): boolean {
    const e: FormErrors = {}
    if (!name.trim()) e.name = 'Tên nhà cung cấp là bắt buộc'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (validate()) {
      onSave({ name: name.trim() } as Omit<Supplier, 'id'>)
      onClose()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setQrImageUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function toggleCategory(cat: string) {
    setProductCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
    setErrors((p) => ({ ...p, productCategories: undefined }))
  }

  const brandOptions = brands.map((b) => ({ value: b.id, label: `${b.name} (${b.code})` }))
  const sourceOptions = supplierSources.map((ss) => ({ value: ss.id, label: `${ss.name} (${ss.code})` }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={supplier ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
      className="max-w-lg"
    >
      {/* Scrollable body */}
      <div className="max-h-[70vh] overflow-y-auto -mx-5 px-5 space-y-4">
        {/* Tên nhà cung cấp */}
        <div>
          <label className={LABEL}>Tên nhà cung cấp <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            autoFocus
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
            placeholder="Nhập tên nhà cung cấp..."
            className={cn(INPUT, errors.name ? 'border-red-400' : 'border-slate-200 dark:border-slate-700')}
          />
          {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name}</p>}
        </div>

        {/* Mã MCC */}
        <div>
          <label className={LABEL}>Mã MCC <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={mccCode}
            onChange={(e) => { setMccCode(e.target.value); setErrors((p) => ({ ...p, mccCode: undefined })) }}
            placeholder="VD: MCC-011"
            className={cn(INPUT, 'font-mono', errors.mccCode ? 'border-red-400' : 'border-slate-200 dark:border-slate-700')}
          />
          {errors.mccCode && <p className="mt-1 text-[10px] text-red-500">{errors.mccCode}</p>}
        </div>

        {/* Branch (multi-select) */}
        <div>
          <label className={LABEL}>Branch <span className="text-red-500">*</span></label>
          <MultiSelect
            options={brandOptions}
            selected={brandIds}
            onChange={(v) => { setBrandIds(v); setErrors((p) => ({ ...p, brandIds: undefined })) }}
            placeholder="Chọn Branch..."
            hasError={!!errors.brandIds}
          />
          {errors.brandIds && <p className="mt-1 text-[10px] text-red-500">{errors.brandIds}</p>}
        </div>

        {/* Suppliers-sources (multi-select) */}
        <div>
          <label className={LABEL}>Suppliers-sources <span className="text-red-500">*</span></label>
          <MultiSelect
            options={sourceOptions}
            selected={supplierSourceIds}
            onChange={(v) => { setSupplierSourceIds(v); setErrors((p) => ({ ...p, supplierSourceIds: undefined })) }}
            placeholder="Chọn Suppliers-source..."
            hasError={!!errors.supplierSourceIds}
          />
          {errors.supplierSourceIds && <p className="mt-1 text-[10px] text-red-500">{errors.supplierSourceIds}</p>}
        </div>

        {/* Loại mặt hàng (checkboxes) */}
        <div>
          <label className={LABEL}>Loại mặt hàng <span className="text-red-500">*</span></label>
          <div className="flex gap-4">
            {PRODUCT_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <span className={cn(
                  'w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0',
                  productCategories.includes(cat)
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'
                )}>
                  {productCategories.includes(cat) && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1,4 3.5,6.5 9,1" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={productCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <span className="text-[12px] text-slate-700 dark:text-slate-300 select-none">{cat}</span>
              </label>
            ))}
          </div>
          {errors.productCategories && <p className="mt-1 text-[10px] text-red-500">{errors.productCategories}</p>}
        </div>

        {/* QR nhóm trao đổi */}
        <div>
          <label className={LABEL}>QR nhóm trao đổi</label>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          {qrImageUrl ? (
            <div className="flex items-start gap-3">
              <img src={qrImageUrl} alt="QR" className="w-24 h-24 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white" />
              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Thay đổi ảnh
                </button>
                <button
                  type="button"
                  onClick={() => setQrImageUrl(undefined)}
                  className="text-[11px] text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Xóa ảnh
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'w-full h-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg',
                'flex flex-col items-center justify-center gap-1.5',
                'text-slate-400 hover:text-indigo-500 hover:border-indigo-400 dark:hover:border-indigo-500',
                'transition-colors cursor-pointer'
              )}
            >
              <ImagePlus className="w-4 h-4" />
              <span className="text-[11px]">Tải ảnh QR lên</span>
            </button>
          )}
        </div>

        {/* Thông tin NCC */}
        <div>
          <label className={LABEL}>Thông tin NCC</label>
          <textarea
            value={nccInfo}
            onChange={(e) => setNccInfo(e.target.value)}
            placeholder="Mô tả chi tiết về nhà cung cấp: địa chỉ, điều kiện thanh toán, ghi chú..."
            rows={4}
            className={cn(INPUT, 'border-slate-200 dark:border-slate-700 resize-none')}
          />
        </div>

        {/* Bottom padding so last field isn't clipped by scroll */}
        <div className="h-1" />
      </div>

      {/* Fixed footer */}
      <div className="flex justify-end gap-2 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-[11px] font-medium border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-1.5 text-[11px] font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Save
        </button>
      </div>
    </Modal>
  )
}
