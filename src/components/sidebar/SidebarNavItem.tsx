import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SidebarNavItemProps {
  to: string
  icon: LucideIcon
  label: string
  badge?: string
}

export function SidebarNavItem({ to, icon: Icon, label, badge }: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] font-medium transition-colors',
          isActive
            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
        )
      }
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[9px] font-bold bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
          {badge}
        </span>
      )}
    </NavLink>
  )
}
