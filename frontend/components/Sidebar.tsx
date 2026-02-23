'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  FileText,
  FileStack,
  LogOut,
  X,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useDisplayUser } from '@/lib/use-display-user'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Experience', href: '/experience', icon: Briefcase },
  { name: 'Education', href: '/education', icon: GraduationCap },
  { name: 'Resumes', href: '/resumes', icon: FileStack },
  { name: 'Generate Resume', href: '/generate', icon: FileText },
]

type SidebarProps = {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { displayName, initial } = useDisplayUser()

  const navContent = (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 overflow-hidden">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gradient-to-br from-[var(--gold)] to-[var(--gold-lt)] font-heading text-sm font-semibold text-[var(--bg)]"
          aria-hidden
        >
          R
        </div>
        <span className="whitespace-nowrap font-body text-base font-semibold text-[var(--text)] max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity] duration-200 group-hover/sb:max-w-[120px] group-hover/sb:opacity-100">
          ResumeAI
        </span>
      </div>

      <nav className="flex flex-1 flex-col pt-6">
        <ul role="list" className="flex flex-1 flex-col gap-0.5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  className={`
                    group/item flex items-center gap-3 rounded-r px-3 py-2.5 text-sm font-medium transition-colors
                    ${isActive
                      ? 'border-l-2 border-[var(--gold)] bg-[rgba(232,213,176,0.06)]'
                      : 'border-l-2 border-transparent text-[var(--muted)] hover:bg-[var(--s2)] hover:text-[var(--text)]'
                    }
                  `}
                  style={{
                    ...(isActive
                      ? {
                          borderLeftColor: 'var(--gold)',
                          backgroundColor: 'rgba(232,213,176,0.06)',
                        }
                      : {}),
                  }}
                >
                  <item.icon
                    className="h-5 w-5 shrink-0 transition-[stroke]"
                    stroke={isActive ? 'var(--gold)' : 'currentColor'}
                    aria-hidden
                  />
                  <span
                    className={`max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity] duration-200 group-hover/sb:max-w-[140px] group-hover/sb:opacity-100 ${isActive ? 'text-[var(--gold)]' : ''}`}
                    style={isActive ? { color: 'var(--gold)' } : undefined}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-auto flex items-center gap-3 overflow-hidden border-t border-[var(--b1)] pt-4">
          <Link
            href="/profile"
            onClick={onMobileClose}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-2 transition-colors hover:bg-[var(--s2)]"
          >
            <div
              className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-lt)] flex items-center justify-center text-sm font-semibold text-[var(--bg)]"
              aria-hidden
            >
              {initial}
            </div>
            <span className="truncate font-body text-sm font-medium text-[var(--text)] max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity] duration-200 group-hover/sb:max-w-[120px] group-hover/sb:opacity-100">
              {displayName}
            </span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--s2)] hover:text-[var(--text)]"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </>
  )

  return (
    <>
      {/* Desktop: fixed collapsible sidebar — z-50 so it stays above main content */}
      <aside
        className="group/sb fixed inset-y-0 left-0 z-50 hidden flex-col overflow-hidden border-r border-b1 bg-s1 transition-[width] duration-200 ease-out md:flex md:w-16 md:hover:w-[200px]"
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="flex h-full w-[200px] min-w-[200px] flex-col px-3 py-4">
          {navContent}
        </div>
      </aside>

      {/* Mobile: overlay when open */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden
          />
          <aside
            className="absolute inset-y-0 left-0 w-full max-w-[200px] flex flex-col border-r border-[var(--b1)] bg-[var(--s1)] shadow-xl"
            style={{ animation: 'fadeUp 0.2s ease-out' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--b1)] px-4 py-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gradient-to-br from-[var(--gold)] to-[var(--gold-lt)] font-heading text-sm font-semibold text-[var(--bg)]"
                  aria-hidden
                >
                  R
                </div>
                <span className="font-body text-base font-semibold text-[var(--text)]">
                  ResumeAI
                </span>
              </div>
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded p-2 text-[var(--muted)] hover:bg-[var(--s2)] hover:text-[var(--text)]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-col gap-0.5">
                  {navigation.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + '/')
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={onMobileClose}
                          className={`
                            flex items-center gap-3 rounded-r px-3 py-2.5 text-sm font-medium transition-colors
                            ${isActive
                              ? 'border-l-2 border-[var(--gold)] bg-[rgba(232,213,176,0.06)] text-[var(--gold)]'
                              : 'border-l-2 border-transparent text-[var(--muted)] hover:bg-[var(--s2)] hover:text-[var(--text)]'
                            }
                          `}
                          style={
                            isActive
                              ? {
                                  borderLeftColor: 'var(--gold)',
                                  backgroundColor: 'rgba(232,213,176,0.06)',
                                }
                              : undefined
                          }
                        >
                          <item.icon
                            className="h-5 w-5 shrink-0"
                            stroke={isActive ? 'var(--gold)' : 'currentColor'}
                          />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <div className="mt-auto flex items-center gap-3 border-t border-[var(--b1)] pt-4">
                  <Link
                    href="/profile"
                    onClick={onMobileClose}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-2"
                  >
                    <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-lt)] flex items-center justify-center text-sm font-semibold text-[var(--bg)]">
                      {initial}
                    </div>
                    <span className="truncate text-sm font-medium text-[var(--text)]">
                      {displayName}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-lg p-2 text-[var(--muted)] hover:text-[var(--text)]"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </nav>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
