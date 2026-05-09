import { Package2 } from 'lucide-react'
import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  return (
    <aside className="w-[220px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Package2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="font-bold text-[13px] text-slate-900 dark:text-white leading-tight">
              Cocandy
            </div>
            <div className="text-[9px] text-slate-400">Procurement ERP</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 p-2 overflow-y-auto">
        <SidebarNav />
      </div>

      {/* User footer */}
      <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
            NH
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-slate-900 dark:text-white truncate">
              Nguyen Hai
            </div>
            <div className="text-[9px] text-slate-400">Admin</div>
          </div>
        </button>
      </div>
    </aside>
  )
}
