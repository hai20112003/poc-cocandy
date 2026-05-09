import { Bell, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'

const BREADCRUMBS: Record<string, { group: string; label: string }> = {
  '/orders': { group: 'Procurement', label: 'Orders' },
  '/suppliers': { group: 'Procurement', label: 'Suppliers' },
  '/brands': { group: 'Procurement', label: 'Brands' },
  '/sources': { group: 'Sourcing', label: 'Sources' },
}

export function Header() {
  const location = useLocation()
  const { theme, toggleTheme } = useUIStore()
  const crumb = BREADCRUMBS[location.pathname] ?? { group: '', label: '' }

  return (
    <header className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-5 gap-3 flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] flex-1 min-w-0">
        <span className="text-slate-400">{crumb.group}</span>
        {crumb.group && <span className="text-slate-300 dark:text-slate-600">/</span>}
        <span className="text-slate-700 dark:text-slate-200 font-medium">{crumb.label}</span>
      </div>

      {/* Global search hint */}
      <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 w-44 cursor-pointer hover:border-indigo-300 transition-colors">
        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <span className="text-[11px] text-slate-400">Search... ⌘K</span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light'
          ? <Moon className="w-3.5 h-3.5 text-slate-500" />
          : <Sun className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {/* Notification */}
      <div className="relative">
        <button className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <Bell className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        </button>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
          3
        </span>
      </div>
    </header>
  )
}
