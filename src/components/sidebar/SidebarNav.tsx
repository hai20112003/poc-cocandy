import { ClipboardList, Building2, Tag, Globe } from 'lucide-react'
import { SidebarNavItem } from './SidebarNavItem'

const NAV_GROUPS = [
  {
    label: 'Procurement',
    items: [
      { to: '/orders', icon: ClipboardList, label: 'Orders', badge: '12' },
      { to: '/suppliers', icon: Building2, label: 'Suppliers' },
      { to: '/brands', icon: Tag, label: 'Brands' },
    ],
  },
  {
    label: 'Sourcing',
    items: [
      { to: '/sources', icon: Globe, label: 'Sources' },
    ],
  },
]

export function SidebarNav() {
  return (
    <nav className="space-y-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-2 mb-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <SidebarNavItem key={item.to} {...item} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
