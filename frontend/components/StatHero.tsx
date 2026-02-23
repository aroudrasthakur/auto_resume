'use client'

import Link from 'next/link'
import { Briefcase, FileText, ArrowRight } from 'lucide-react'

type StatHeroProps = {
  profileStatus: string
  experiencesCount: number
  resumesCount: number
}

export default function StatHero({
  profileStatus,
  experiencesCount,
  resumesCount,
}: StatHeroProps) {
  return (
    <div
      className="grid grid-cols-1 gap-px rounded border border-b1 overflow-hidden bg-b1 md:grid-cols-2"
      style={{
        borderColor: 'var(--b1)',
        borderRadius: '4px',
      }}
    >
      <Link
        href="/profile"
        className="group relative flex flex-col justify-end bg-s1 p-5 transition-colors hover:bg-s2 md:row-span-2"
      >
        <span
          className="font-heading text-4xl text-text md:text-5xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {profileStatus}
        </span>
        <span className="font-mono mt-1.5 text-xs uppercase tracking-wider text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
          Profile status
        </span>
        <span className="absolute bottom-4 right-4 text-muted opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowRight className="h-4 w-4" />
        </span>
        {/* Decorative circles */}
        <span
          className="absolute bottom-2 right-2 h-16 w-16 rounded-full border border-b2 opacity-20"
          style={{ borderColor: 'var(--b2)' }}
          aria-hidden
        />
        <span
          className="absolute bottom-4 right-4 h-8 w-8 rounded-full border border-b2 opacity-15"
          style={{ borderColor: 'var(--b2)' }}
          aria-hidden
        />
      </Link>

      <Link
        href="/experience"
        className="group flex flex-col justify-center bg-s1 p-5 transition-colors hover:bg-s2"
      >
        <div className="flex items-center justify-between">
          <Briefcase className="h-5 w-5 text-muted" stroke="currentColor" />
          <ArrowRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <span
          className="font-heading mt-2 text-2xl text-text"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {experiencesCount}
        </span>
        <span className="font-mono text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
          Experiences
        </span>
      </Link>

      <Link
        href="/resumes"
        className="group flex flex-col justify-center bg-s1 p-5 transition-colors hover:bg-s2"
      >
        <div className="flex items-center justify-between">
          <FileText className="h-5 w-5 text-muted" stroke="currentColor" />
          <ArrowRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <span
          className="font-heading mt-2 text-2xl text-text"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {resumesCount}
        </span>
        <span className="font-mono text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
          Resumes generated
        </span>
      </Link>
    </div>
  )
}
