'use client'

import Link from 'next/link'

export default function LandingFooter() {
  return (
    <footer className="border-t border-b1 py-9 px-6 md:px-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <Link
        href="/"
        className="font-heading text-base text-text no-underline"
      >
        <span className="text-text">Resume</span>
        <span className="text-gold italic">AI</span>
      </Link>
      <p className="font-mono text-[9px] uppercase text-muted2">
        © 2026 ResumeAI · All rights reserved
      </p>
    </footer>
  )
}
