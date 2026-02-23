'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRequireAuth } from '@/lib/auth-context'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import DashboardRightPanel from '@/components/DashboardRightPanel'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isLoading } = useRequireAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  const isDashboardPage = pathname === '/dashboard'
  const showRightPanel = isDashboardPage

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gold" />
          <p className="font-body text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-1 flex-col md:ml-16">
        <TopBar
          onMenuClick={() => setMobileMenuOpen(true)}
          showPanelToggle={isDashboardPage}
          onPanelToggle={() => setPanelOpen(true)}
        />

        <div className="flex flex-1 flex-col xl:flex-row">
          <main className="min-w-0 flex-1">
            {children}
          </main>

          {showRightPanel && (
            <>
              {/* Desktop: right panel visible at xl */}
              <div className="hidden w-[320px] shrink-0 border-l border-b1 bg-s1 xl:block">
                <DashboardRightPanel />
              </div>

              {/* Tablet: drawer overlay */}
              {panelOpen && (
                <div className="fixed inset-0 z-40 xl:hidden">
                  <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setPanelOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-full max-w-[320px] border-l border-b1 bg-s1 shadow-xl">
                    <DashboardRightPanel onClose={() => setPanelOpen(false)} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
