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
        <Link href={backHref} className="auth-topbar-back">
          {backLabel}
        </Link>
      )}
      <Link href="/" className="auth-topbar-logo">
        <span className="text-[var(--text)]">Resume</span>
        <span className="italic text-gold">AI</span>
      </Link>
    </div>
  )
}
