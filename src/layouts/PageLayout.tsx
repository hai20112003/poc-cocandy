import type { ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="p-5 space-y-4 max-w-[1400px]">
      {children}
    </div>
  )
}
