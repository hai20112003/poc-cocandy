import { useState, useEffect } from 'react'
import { Modal } from '@/components/shared/Modal'
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
  code?: string
}

export function SupplierModal({ open, onClose, supplier, onSave }: SupplierModalProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (open) {
      setName(supplier?.name ?? '')
      setCode(supplier?.code ?? '')
      setErrors({})
    }
  }, [open, supplier])

  function validate(): boolean {
    const e: FormErrors = {}
    if (!name.trim()) e.name = 'Tên supplier là bắt buộc'
    if (!code.trim()) e.code = 'Mã code là bắt buộc'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (validate()) {
      onSave({ name: name.trim(), code: code.trim() })
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={supplier ? 'Chỉnh sửa Supplier' : 'Thêm Supplier mới'}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Tên supplier <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })) }}
            placeholder="Nhập tên supplier..."
            autoFocus
            className={cn(
              'w-full px-3 py-2 text-[12px] rounded-lg border bg-white dark:bg-slate-800',
              'text-slate-900 dark:text-white placeholder-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow',
              errors.name ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
            )}
          />
          {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Mã code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setErrors((prev) => ({ ...prev, code: undefined })) }}
            placeholder="VD: SUP-021"
            className={cn(
              'w-full px-3 py-2 text-[12px] rounded-lg border bg-white dark:bg-slate-800 font-mono',
              'text-slate-900 dark:text-white placeholder-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow',
              errors.code ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
            )}
          />
          {errors.code && <p className="mt-1 text-[10px] text-red-500">{errors.code}</p>}
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
