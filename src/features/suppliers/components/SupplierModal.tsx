import { useState, useEffect, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
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
  mccCode?: string
  brandId?: string
  supplierSourceId?: string
  productType?: string
}

const FIELD_CLASS = cn(
  'w-full px-3 py-2 text-[12px] rounded-lg border bg-white dark:bg-slate-800',
  'text-slate-900 dark:text-white placeholder-slate-400',
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow'
)

const LABEL_CLASS = 'block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1.5'

export function SupplierModal({ open, onClose, supplier, onSave }: SupplierModalProps) {
  const brands = useBrandsStore((s) => s.brands)
  const supplierSources = useSupplierSourcesStore((s) => s.supplierSources)

  const [mccCode, setMccCode] = useState('')
  const [brandId, setBrandId] = useState('')
  const [supplierSourceId, setSupplierSourceId] = useState('')
  const [productType, setProductType] = useState('')
  const [qrImageUrl, setQrImageUrl] = useState<string | undefined>(undefined)
  const [errors, setErrors] = useState<FormErrors>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setMccCode(supplier?.mccCode ?? '')
      setBrandId(supplier?.brandId ?? '')
      setSupplierSourceId(supplier?.supplierSourceId ?? '')
      setProductType(supplier?.productType ?? '')
      setQrImageUrl(supplier?.qrImageUrl)
      setErrors({})
    }
  }, [open, supplier])

  function validate(): boolean {
    const e: FormErrors = {}
    if (!mccCode.trim()) e.mccCode = 'Mã MCC là bắt buộc'
    if (!brandId) e.brandId = 'Vui lòng chọn Branch'
    if (!supplierSourceId) e.supplierSourceId = 'Vui lòng chọn Suppliers-source'
    if (!productType.trim()) e.productType = 'Loại sản phẩm là bắt buộc'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (validate()) {
      onSave({ mccCode: mccCode.trim(), brandId, supplierSourceId, productType: productType.trim(), qrImageUrl })
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={supplier ? 'Chỉnh sửa Supplier' : 'Thêm Supplier mới'}
      className="max-w-lg"
    >
      <div className="space-y-4">
        {/* Mã MCC */}
        <div>
          <label className={LABEL_CLASS}>
            Mã MCC <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={mccCode}
            autoFocus
            onChange={(e) => { setMccCode(e.target.value); setErrors((p) => ({ ...p, mccCode: undefined })) }}
            placeholder="VD: MCC-011"
            className={cn(FIELD_CLASS, 'font-mono', errors.mccCode ? 'border-red-400' : 'border-slate-200 dark:border-slate-700')}
          />
          {errors.mccCode && <p className="mt-1 text-[10px] text-red-500">{errors.mccCode}</p>}
        </div>

        {/* Branch (Brand) */}
        <div>
          <label className={LABEL_CLASS}>
            Branch <span className="text-red-500">*</span>
          </label>
          <select
            value={brandId}
            onChange={(e) => { setBrandId(e.target.value); setErrors((p) => ({ ...p, brandId: undefined })) }}
            className={cn(FIELD_CLASS, errors.brandId ? 'border-red-400' : 'border-slate-200 dark:border-slate-700')}
          >
            <option value="">-- Chọn Branch --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
            ))}
          </select>
          {errors.brandId && <p className="mt-1 text-[10px] text-red-500">{errors.brandId}</p>}
        </div>

        {/* Suppliers-sources */}
        <div>
          <label className={LABEL_CLASS}>
            Suppliers-source <span className="text-red-500">*</span>
          </label>
          <select
            value={supplierSourceId}
            onChange={(e) => { setSupplierSourceId(e.target.value); setErrors((p) => ({ ...p, supplierSourceId: undefined })) }}
            className={cn(FIELD_CLASS, errors.supplierSourceId ? 'border-red-400' : 'border-slate-200 dark:border-slate-700')}
          >
            <option value="">-- Chọn Suppliers-source --</option>
            {supplierSources.map((ss) => (
              <option key={ss.id} value={ss.id}>{ss.name} ({ss.code})</option>
            ))}
          </select>
          {errors.supplierSourceId && <p className="mt-1 text-[10px] text-red-500">{errors.supplierSourceId}</p>}
        </div>

        {/* Loại sản phẩm */}
        <div>
          <label className={LABEL_CLASS}>
            Loại sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={productType}
            onChange={(e) => { setProductType(e.target.value); setErrors((p) => ({ ...p, productType: undefined })) }}
            placeholder="VD: Giày thể thao, Quần áo..."
            className={cn(FIELD_CLASS, errors.productType ? 'border-red-400' : 'border-slate-200 dark:border-slate-700')}
          />
          {errors.productType && <p className="mt-1 text-[10px] text-red-500">{errors.productType}</p>}
        </div>

        {/* QR nhóm trao đổi */}
        <div>
          <label className={LABEL_CLASS}>QR nhóm trao đổi</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {qrImageUrl ? (
            <div className="relative inline-block">
              <img
                src={qrImageUrl}
                alt="QR code"
                className="w-24 h-24 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
              />
              <button
                type="button"
                onClick={() => setQrImageUrl(undefined)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 block text-[10px] text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Thay đổi ảnh
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg',
                'flex flex-col items-center justify-center gap-1.5',
                'text-slate-400 hover:text-indigo-500 hover:border-indigo-400 dark:hover:border-indigo-500',
                'transition-colors cursor-pointer'
              )}
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-[11px]">Tải ảnh QR lên</span>
              <span className="text-[10px] text-slate-300">PNG, JPG, GIF</span>
            </button>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
      </div>
    </Modal>
  )
}
