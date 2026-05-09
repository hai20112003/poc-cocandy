import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  hasError?: boolean
}

export function MultiSelect({ options, selected, onChange, placeholder = 'Chọn...', hasError }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  function removeOne(value: string, e: React.MouseEvent) {
    e.stopPropagation()
    onChange(selected.filter((v) => v !== value))
  }

  const selectedLabels = options.filter((o) => selected.includes(o.value))

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full min-h-[34px] px-3 py-1.5 text-[12px] rounded-lg border bg-white dark:bg-slate-800',
          'text-left flex items-center gap-1.5 flex-wrap',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow',
          hasError ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
        )}
      >
        {selectedLabels.length === 0 ? (
          <span className="text-slate-400 flex-1">{placeholder}</span>
        ) : (
          <>
            {selectedLabels.map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded px-1.5 py-0.5 text-[10px] font-medium"
              >
                {o.label}
                <X
                  className="w-2.5 h-2.5 hover:text-indigo-900 cursor-pointer"
                  onClick={(e) => removeOne(o.value, e)}
                />
              </span>
            ))}
          </>
        )}
        <ChevronDown className={cn('w-3 h-3 text-slate-400 ml-auto flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-[11px] text-slate-400">Không có dữ liệu</p>
          ) : (
            options.map((option) => {
              const isSelected = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left transition-colors',
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  )}
                >
                  <span className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-slate-300 dark:border-slate-600'
                  )}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  {option.label}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
