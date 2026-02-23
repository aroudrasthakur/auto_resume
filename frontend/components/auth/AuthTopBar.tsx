'use client'

import Link from 'next/link'

type AuthTopBarProps = {
  backLabel?: string
  backHref?: string
  onBackClick?: () => void
}

export default function AuthTopBar({
  backLabel = 'Back to Home',
  backHref = '/',
  onBackClick,
}: AuthTopBarProps) {
  return (
    <div className="auth-topbar">
      {onBackClick ? (
        <button
          type="button"
          onClick={onBackClick}
          className="auth-topbar-back"
          aria-label={backLabel}
        >
          {backLabel}
        </button>
      ) : (
        <Link
          href={backHref}
          className="auth-topbar-back"
          style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#4a4a4a' }}
        >
          {backLabel}
        </Link>
      )}
      <Link
        href="/"
        className="auth-topbar-logo"
        style={{ fontFamily: "'DM Serif Display', serif", fontSize: '17px', letterSpacing: '-0.3px', color: '#f0ede8', textDecoration: 'none' }}
      >
        Resume<em style={{ color: '#c9a96e', fontStyle: 'italic' }}>AI</em>
      </Link>
    </div>
  )
}
