'use client'

import { Lock, Hash, KeyRound } from 'lucide-react'

type ForgotPasswordLeftProps = {
  step: 1 | 2 | 3 | 4
}

const steps = [
  { num: 1, icon: Lock, label: 'Enter your email' },
  { num: 2, icon: Hash, label: 'Enter the code' },
  { num: 3, icon: KeyRound, label: 'Set new password' },
]

export default function ForgotPasswordLeft({ step }: ForgotPasswordLeftProps) {
  return (
    <div className="flex flex-col justify-center p-8 lg:p-12">
      <p className="text-gold text-sm uppercase tracking-wider mb-2">Password reset</p>
      <h2 className="font-heading text-2xl text-text mb-2">
        Locked out? We&apos;ve got you <em className="text-gold not-italic">covered.</em>
      </h2>
      <p className="text-muted text-sm mb-8">
        Follow the steps to reset your password securely.
      </p>
      <ul className="space-y-4">
        {steps.map(({ num, icon: Icon, label }) => {
          const isCurrent = step === num
          const isDone = step > num
          return (
            <li
              key={num}
              className={`flex items-center gap-3 ${isCurrent ? 'text-gold' : isDone ? 'text-muted' : 'text-muted'}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isCurrent ? 'border-gold bg-gold/10' : isDone ? 'border-gold bg-gold/5' : 'border-b2 bg-b1'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className={isCurrent ? 'font-medium' : ''}>{label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}