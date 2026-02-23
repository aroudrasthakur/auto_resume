'use client'

import { Check } from 'lucide-react'

export default function SuccessState() {
  return (
    <div className="text-center py-6">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold text-gold mb-4">
        <Check className="h-8 w-8" />
      </div>
      <h3 className="font-heading text-xl text-text mb-1">
        Password <em className="text-gold not-italic">reset.</em>
      </h3>
      <p className="text-sm text-muted">Redirecting you to sign in...</p>
    </div>
  )
}