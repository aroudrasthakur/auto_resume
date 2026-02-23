'use client'

import Link from 'next/link'
import {
  User,
  GraduationCap,
  Briefcase,
  FileText,
  FileStack,
  Code2,
  Sparkles,
  X,
} from 'lucide-react'

type DashboardRightPanelProps = {
  onClose?: () => void
}

const profileSections = [
  { name: 'Personal Info', href: '/profile', icon: User, complete: false },
  { name: 'Experience', href: '/experience', icon: Briefcase, complete: false },
  { name: 'Education', href: '/education', icon: GraduationCap, complete: false },
  { name: 'Skills', href: '/profile', icon: FileText, complete: false },
  { name: 'Projects', href: '/profile', icon: Code2, complete: false },
  { name: 'Resumes', href: '/resumes', icon: FileStack, complete: false },
]

const insights = [
  'Complete your profile to unlock tailored resume suggestions.',
  'Add at least one experience for stronger AI-generated content.',
  'Skills and education help the AI match you to job descriptions.',
]

export default function DashboardRightPanel({ onClose }: DashboardRightPanelProps) {
  const insight = insights[0]

  return (
    <div className="flex h-full flex-col overflow-hidden bg-s1">
      {onClose && (
        <div className="flex shrink-0 justify-end border-b border-b1 p-2 xl:hidden">
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-muted hover:bg-s2 hover:text-text"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        {/* 6a. Profile sections list */}
        <section className="mb-6">
          <p
            className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted mb-3"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Profile sections
          </p>
          <div
            className="grid gap-px rounded border border-b1 overflow-hidden bg-b1"
            style={{ borderColor: 'var(--b1)' }}
          >
            {profileSections.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center gap-3 bg-s1 px-3 py-2.5 transition-colors hover:bg-s2"
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-b2"
                  style={{ borderColor: 'var(--b2)' }}
                >
                  <item.icon
                    className="h-3.5 w-3.5 text-muted transition-[stroke] group-hover:stroke-[var(--gold)]"
                    stroke="currentColor"
                  />
                </div>
                <span className="flex-1 font-body text-sm font-medium text-text">
                  {item.name}
                </span>
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.complete ? 'var(--green)' : 'var(--muted2)',
                  }}
                  aria-hidden
                />
                <span className="text-muted2 group-hover:text-gold transition-colors">
                  ›
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 6b. AI insight block */}
        <section className="relative mb-6 overflow-hidden rounded border border-b1 bg-s1 p-4">
          <div
            className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            }}
          />
          <p
            className="absolute right-4 top-1/2 -translate-y-1/2 font-heading italic text-b2 text-[60px] leading-none select-none"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--b2)',
            }}
            aria-hidden
          >
            AI
          </p>
          <div className="relative">
            <span
              className="font-mono text-[9px] uppercase tracking-wider text-gold"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Insight
            </span>
            <p
              className="font-heading mt-1 text-base text-text"
              style={{ fontFamily: 'var(--font-heading)', fontSize: '16px' }}
            >
              {insight}
            </p>
          </div>
        </section>

        {/* 6c. Generate CTA card */}
        <section className="relative overflow-hidden rounded border border-b2 p-[22px] transition-colors hover:border-gold">
          <div
            className="pointer-events-none absolute inset-0 opacity-100"
            style={{
              background: 'linear-gradient(135deg, rgba(201,169,110,0.05), transparent 60%)',
            }}
          />
          <div className="relative">
            <p className="font-body text-sm font-semibold text-text mb-1">
              Ready to build your resume?
            </p>
            <p className="font-body text-xs text-muted mb-4">
              Let AI tailor your experience for any job.
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 rounded px-3 py-2 font-body text-sm font-semibold text-[var(--bg)] transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--gold)',
                borderRadius: '3px',
              }}
            >
              <Sparkles className="h-4 w-4" />
              Generate Resume
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
