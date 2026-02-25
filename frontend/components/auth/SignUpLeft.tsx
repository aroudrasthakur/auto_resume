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
      <div className="relative z-[1] flex flex-col justify-between h-full min-h-0">
        <div className="min-h-0 shrink">
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#c9a96e',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <span style={{ width: '24px', height: '1px', background: '#c9a96e', display: 'block', flexShrink: 0 }} />
            Create account
          </div>
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 'clamp(36px, 4vw, 56px)',
              letterSpacing: '-2px',
              lineHeight: '1.0',
              color: '#f0ede8',
              marginBottom: '12px',
              maxWidth: '320px',
            }}
          >
            Start building résumés that get you <em style={{ color: '#c9a96e', fontStyle: 'italic' }}>hired.</em>
          </h1>
          <p style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: 1.7, maxWidth: '320px', marginBottom: '24px' }}>
            Fill in your details once. Then paste any job description and let AI do the rest.
          </p>

          <div className="step-tracker flex-shrink-0" style={{ border: '1px solid #1a1a1a', borderRadius: '3px', overflow: 'hidden', background: '#0d0d0d' }}>
            {steps.map((step, i) => (
              <div
                key={step.num}
                ref={(el) => { rowRefs.current[i] = el }}
                className="step-row-item"
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  background: step.active ? 'rgba(201,169,110,0.06)' : 'transparent',
                  borderBottom: i < steps.length - 1 ? '1px solid #1a1a1a' : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '18px',
                    fontStyle: 'italic',
                    color: step.active ? '#c9a96e' : '#2e2e2e',
                    flexShrink: 0,
                  }}
                >
                  {step.done ? <span style={{ fontFamily: "'DM Mono', monospace", fontStyle: 'normal', color: '#4ade80' }}>✓</span> : step.num}
                </span>
                <div>
                  <p style={{ color: step.active ? '#f0ede8' : '#4a4a4a', fontSize: '14px', fontWeight: 500, margin: 0 }}>{step.title}</p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '1px', color: '#2e2e2e', marginTop: '2px' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          className="flex-shrink-0 mt-auto pt-4"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            lineHeight: 1.6,
            color: '#2e2e2e',
            maxWidth: '280px',
          }}
        >
          <span style={{ color: '#4a4a4a' }}>Your data is encrypted and never shared.</span>
          <br />
          Built on AWS Cognito · Jake&apos;s Resume Template
        </p>
      </div>
    </div>
  )
}
