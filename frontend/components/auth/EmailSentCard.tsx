'use client'

import { Mail } from 'lucide-react'

type EmailSentCardProps = {
  email: string
}

export default function EmailSentCard({ email }: EmailSentCardProps) {
  return (
    <div className="rounded-xl border border-b2 bg-b1 p-4 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
        <Mail className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-text">Check your inbox</p>
        <p className="text-sm text-muted">We sent a code to <span className="text-text">{email}</span></p>
      </div>
    </div>
  )
}