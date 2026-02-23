'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const steps = [
  { num: 1, title: 'Create your account', desc: 'Name, email, password', active: true, done: false },
  { num: 2, title: 'Complete your profile', desc: 'Experience, education, skills', active: false, done: false },
  { num: 3, title: 'Generate résumés', desc: 'Tailored to every job', active: false, done: false },
]

export default function SignUpLeft() {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    rowRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.fromTo(
        el,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.35 + i * 0.1, ease: 'power3.out' }
      )
    })
  }, [])

  return (
    <div className="signup-left flex flex-col justify-between h-full min-h-0">
      <div className="min-h-0 flex flex-col gap-0 shrink">
        <p
          className="mb-1"
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--gold)',
          }}
        >
          <span className="inline-block w-6 h-px bg-gold mr-2 align-middle" style={{ marginRight: '8px' }} aria-hidden />
          Create account
        </p>
        <h2
          className="font-heading text-text leading-tight mb-1"
          style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            maxWidth: '320px',
          }}
        >
          Start building résumés that get you <em className="text-gold not-italic">hired.</em>
        </h2>
        <p className="text-sm text-muted mb-4" style={{ maxWidth: '320px', lineHeight: 1.5, fontSize: '13px' }}>
          Fill in your details once. Then paste any job description and let AI do the rest.
        </p>

        <div className="space-y-0 step-tracker flex-shrink-0">
          {steps.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => { rowRefs.current[i] = el }}
              className="step-row-item py-2 px-3 rounded"
              style={{
                background: step.active ? 'rgba(201,169,110,0.06)' : 'transparent',
                borderBottom: i < steps.length - 1 ? '1px solid var(--b1)' : 'none',
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="font-heading italic shrink-0"
                  style={{
                    fontSize: '16px',
                    color: step.active ? 'var(--gold)' : 'var(--muted2)',
                  }}
                >
                  {step.done ? (
                    <span className="font-mono not-italic text-green">✓</span>
                  ) : (
                    step.num
                  )}
                </span>
                <div>
                  <p
                    className="font-medium"
                    style={{
                      color: step.active ? 'var(--text)' : 'var(--muted)',
                      fontSize: '13px',
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="text-muted2"
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: '8px',
                      letterSpacing: '1px',
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p
        className="text-muted2 mt-3 flex-shrink-0"
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '8px',
          lineHeight: 1.5,
          maxWidth: '280px',
        }}
      >
        <span className="text-muted">Your data is encrypted and never shared.</span>
        <br />
        Built on AWS Cognito · Jake&apos;s Resume Template
      </p>
    </div>
  )
}
