'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, PanelRight, Plus } from 'lucide-react'

type TopBarProps = {
  onMenuClick: () => void
  showPanelToggle?: boolean
  onPanelToggle?: () => void
}

function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname.startsWith('/profile')) return 'Profile'
  if (pathname.startsWith('/experience')) return 'Experience'
  if (pathname.startsWith('/generate')) return 'Generate Resume'
  return 'Dashboard'
}

export default function TopBar({ onMenuClick, showPanelToggle, onPanelToggle }: TopBarProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header
      className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-b1 bg-bg px-4 md:px-6"
      style={{
        height: '56px',
        borderBottomColor: 'var(--b1)',
        backgroundColor: 'var(--bg)',
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="show-mobile -ml-2 rounded p-2 text-muted hover:bg-s2 hover:text-text md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1
            className="font-heading text-base font-normal text-text truncate"
            style={{ fontSize: '16px', fontFamily: 'var(--font-heading)' }}
          >
            {title}
          </h1>
          <p
            className="font-mono mt-0.5 hidden text-[10px] text-muted md:block"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}
          >
            {dateStr}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {showPanelToggle && onPanelToggle && (
          <button
            type="button"
            onClick={onPanelToggle}
            className="xl:hidden inline-flex items-center gap-1.5 rounded px-2 py-1.5 font-mono text-xs text-muted hover:bg-s2 hover:text-text"
            aria-label="Open panel"
          >
            <PanelRight className="h-4 w-4" />
            <span>panel</span>
          </button>
        )}
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 rounded px-3 py-2 font-body text-sm font-semibold text-[var(--bg)] transition-transform hover:scale-[1.02]"
          style={{
            backgroundColor: 'var(--gold)',
            borderRadius: '3px',
          }}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Generate Resume
        </Link>
      </div>
    </header>
  )
}
