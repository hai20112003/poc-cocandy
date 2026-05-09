import { cn } from '@/utils/cn'

interface LoadingSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingSkeleton({ rows = 8, columns = 5, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex gap-3 px-3 py-[7px] border-b border-slate-100 dark:border-slate-800">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex gap-3 px-3 py-[6px] border-b border-slate-50 dark:border-slate-800/50"
        >
          <div className="h-2.5 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
          {Array.from({ length: columns - 1 }).map((_, c) => (
            <div key={c} className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
