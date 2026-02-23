'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { User, Mail, ArrowLeft, UserCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()

  const displayName =
    user?.nickname ||
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name) ||
    'User'
  const initial =
    user?.nickname?.charAt(0).toUpperCase() ||
    user?.firstName?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    'U'

  return (
    <div className="flex flex-col gap-7 px-5 py-8 md:gap-10 md:px-10 md:py-10">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </div>

      <div
        className="grid gap-px overflow-hidden rounded border border-b1 bg-b1"
        style={{ borderRadius: '4px' }}
      >
        <div
          className="bg-s1 p-6 md:p-8"
          style={{ background: 'var(--s1)' }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-b2 font-heading text-3xl font-semibold text-gold"
              style={{
                borderColor: 'var(--b2)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {initial}
            </div>
            <div>
              <h1
                className="font-heading text-2xl text-text"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {displayName}
              </h1>
              {user?.email && (
                <p className="mt-1 flex items-center gap-2 font-body text-sm text-muted">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-s1 px-6 py-6 md:px-8">
          <h2
            className="font-heading text-lg text-text mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Account information
          </h2>
          <div className="grid gap-3 md:grid-cols-1">
            {user?.nickname && (
              <div className="flex items-center gap-3 rounded border border-b1 bg-s2/50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-b2">
                  <UserCircle className="h-5 w-5 text-gold" stroke="var(--gold)" />
                </div>
                <div>
                  <p className="font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Nickname</p>
                  <p className="font-body font-semibold text-text">{user.nickname}</p>
                </div>
              </div>
            )}
            {(user?.firstName || user?.lastName) && (
              <div className="flex items-center gap-3 rounded border border-b1 bg-s2/50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-b2">
                  <User className="h-5 w-5 text-gold" stroke="var(--gold)" />
                </div>
                <div>
                  <p className="font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Full name</p>
                  <p className="font-body font-semibold text-text">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || user.lastName || '—'}
                  </p>
                </div>
              </div>
            )}
            {user?.email && (
              <div className="flex items-center gap-3 rounded border border-b1 bg-s2/50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-b2">
                  <Mail className="h-5 w-5 text-gold" stroke="var(--gold)" />
                </div>
                <div>
                  <p className="font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Email</p>
                  <p className="font-body font-semibold text-text break-all">{user.email}</p>
                </div>
              </div>
            )}
            {user?.sub && (
              <div className="flex items-center gap-3 rounded border border-b1 bg-s2/50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-b2">
                  <User className="h-5 w-5 text-gold" stroke="var(--gold)" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>User ID</p>
                  <p className="font-mono text-sm text-muted break-all" style={{ fontFamily: 'var(--font-mono)' }}>{user.sub}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-b1 bg-s1 px-6 py-4 md:px-8">
          <p className="font-body text-xs text-muted" style={{ fontSize: '12.5px' }}>
            Account information is managed through AWS Cognito. To update your profile, please contact support or use the Cognito console.
          </p>
        </div>
      </div>
    </div>
  )
}
