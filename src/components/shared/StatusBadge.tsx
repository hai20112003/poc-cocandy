import { cn } from '@/utils/cn'

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple'

interface StatusBadgeProps {
  children: React.ReactNode
  variant: Variant
}

const variants: Record<Variant, string> = {
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  danger: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  purple: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
}

export function StatusBadge({ children, variant }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold',
        variants[variant]
      )}
    >
      {children}
    </span>
  )
}
