'use client'

import { useEffect, useRef, useState } from 'react'

const CIRCUMFERENCE = 283 // 2 * Math.PI * 45

type Step = { label: string; done: boolean }

type ProgressRingProps = {
  completion: number
  steps: Step[]
}

export default function ProgressRing({ completion, steps }: ProgressRingProps) {
  const ringRef = useRef<SVGCircleElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const offset = CIRCUMFERENCE - (completion / 100) * CIRCUMFERENCE

  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-8">
      <div className="relative flex h-[100px] w-[100px] shrink-0 justify-center md:justify-start">
        <svg
          viewBox="0 0 100 100"
          className="h-[100px] w-[100px] -rotate-90"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--b2)"
            strokeWidth="6"
          />
          <circle
            ref={ringRef}
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={mounted ? offset : CIRCUMFERENCE}
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-heading text-2xl text-gold"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {completion}%
          </span>
          <span
            className="font-mono text-[9px] uppercase tracking-wider text-muted"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            DONE
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h2
          className="font-heading text-2xl text-text md:text-[1.75rem]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Profile is <em className="italic text-gold">empty.</em>
        </h2>
        <p
          className="mt-3 font-body text-muted leading-relaxed"
          style={{ fontSize: '13px', lineHeight: 1.6 }}
        >
          Complete the steps below so we can generate stronger, tailored resumes for you.
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {steps.map((step) => (
            <li
              key={step.label}
              className="flex items-center gap-2 font-mono text-[10px]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: step.done ? 'var(--green)' : 'var(--muted)',
                }}
                aria-hidden
              />
              {step.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
