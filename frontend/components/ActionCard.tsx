'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

type ActionCardProps = {
  counter: string
  icon: LucideIcon
  title: string
  description: string
  href: string
}

export default function ActionCard({
  counter,
  icon: Icon,
  title,
  description,
  href,
}: ActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col bg-s1 p-[22px] transition-colors hover:bg-s2"
      style={{ paddingTop: '24px', paddingBottom: '24px', paddingLeft: '22px', paddingRight: '22px' }}
    >
      <span
        className="font-mono text-xs text-muted2 mb-3"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {counter}
      </span>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-b2 mb-3"
        style={{ borderColor: 'var(--b2)', borderRadius: '4px' }}
      >
        <Icon className="h-4 w-4" stroke="var(--gold)" />
      </div>
      <h3
        className="font-body font-semibold text-text"
        style={{ fontSize: '13.5px', fontFamily: 'var(--font-body)' }}
      >
        {title}
      </h3>
      <p
        className="mt-1 font-body text-muted leading-snug"
        style={{ fontSize: '11.5px', lineHeight: 1.5 }}
      >
        {description}
      </p>
      <span className="mt-3 inline-block font-body text-muted2 transition-colors group-hover:text-gold">
        →
      </span>
    </Link>
  )
}
