'use client'

import { Check, X } from 'lucide-react'

type PasswordReqsProps = {
  password: string
}

const rules = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p), label: 'Upper and lowercase' },
  { test: (p: string) => /\d/.test(p), label: 'At least one number' },
  { test: (p: string) => /[^a-zA-Z0-9]/.test(p), label: 'At least one symbol' },
]

export default function PasswordReqs({ password }: PasswordReqsProps) {
  return (
    <ul className="mt-2 space-y-1.5 text-sm">
      {rules.map(({ test, label }) => {
        const ok = test(password)
        return (
          <li key={label} className={`flex items-center gap-2 ${ok ? 'text-green' : 'text-muted'}`}>
            {ok ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
            <span>{label}</span>
          </li>
        )
      })}
    </ul>
  )
}