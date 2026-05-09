import { ClipboardList, Building2, Tag, Network } from 'lucide-react'
import { SidebarNavItem } from './SidebarNavItem'

const NAV_GROUPS = [
  {
    label: 'Nhà Cung Cấp',
    items: [
      { to: '/brands', icon: Tag, label: 'Thương hiệu' },
      { to: '/supplier-sources', icon: Network, label: 'Nguồn cung cấp' },
      { to: '/suppliers', icon: Building2, label: 'Nhà cung cấp' },
      { to: '/orders', icon: ClipboardList, label: 'Đơn hàng' },
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
