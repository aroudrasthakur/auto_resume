'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function SignInLeft() {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20, rotation: 0.5 },
      { opacity: 1, y: 0, rotation: 0, duration: 0.9, delay: 0.4, ease: 'power3.out' }
    )
    gsap.to(cardRef.current, {
      y: -6,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1.5,
    })
  }, [])

  return (
    <div className="signin-left flex flex-col justify-between h-full min-h-0">
      {/* Top: eyebrow + headline + sub */}
      <div className="min-h-0 shrink">
        <p
          className="auth-eyebrow mb-1"
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--gold)',
          }}
        >
          <span
            className="inline-block w-6 h-px bg-gold mr-2 align-middle"
            style={{ marginRight: '8px', verticalAlign: 'middle' }}
            aria-hidden
          />
          Welcome back
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
          Your next role is <em className="text-gold not-italic">one paste</em> away.
        </h2>
        <p className="text-muted text-[13px] leading-snug" style={{ maxWidth: '320px', lineHeight: 1.5 }}>
          Sign in to access your profile and generate tailored résumés for every job you apply to.
        </p>
      </div>

      {/* Middle: mini resume card */}
      <div className="my-3 shrink-0">
        <div
          className="flex items-center gap-2 mb-1"
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '8px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--muted2)',
          }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse"
            style={{ animation: 'pulseDot 2s ease-in-out infinite' }}
            aria-hidden
          />
          Last generated · 2h ago
        </div>
        <div
          ref={cardRef}
          className="rp-card rounded overflow-hidden"
          style={{
            background: '#f9f7f3',
            borderRadius: '3px',
            padding: '12px 16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
          }}
        >
          <p className="font-heading text-[13px] text-[#111]">Alexandra Chen</p>
          <p className="text-[9px] text-[#666] mb-2">Senior Software Engineer</p>
          <div className="h-px bg-[#e8e4de] my-2" />
          <ul className="space-y-0.5 text-[10px] text-[#333] mb-2">
            <li className="flex gap-1.5">
              <span className="text-gold">—</span>
              Led ML pipeline dev, reduced latency 40%
            </li>
            <li className="flex gap-1.5">
              <span className="text-gold">—</span>
              Architected system for 2M+ daily users
            </li>
          </ul>
          <div className="flex flex-wrap gap-1">
            {['Python', 'React', 'AWS', 'Go'].map((s) => (
              <span
                key={s}
                className="px-1 py-0.5 rounded"
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '7px',
                  background: '#f0ede8',
                  borderRadius: '2px',
                  color: '#333',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: 2×2 stats grid */}
      <div
        className="grid grid-cols-2 gap-2 shrink-0"
        style={{
          borderTop: '1px solid var(--b1)',
          paddingTop: '12px',
        }}
      >
        {[
          { value: '2×', label: 'More callbacks' },
          { value: '<60s', label: 'To generate' },
          { value: 'ATS', label: 'Optimised output' },
          { value: "Jake's", label: 'Template standard' },
        ].map(({ value, label }) => (
          <div key={label}>
            <p className="font-heading text-gold leading-none" style={{ fontSize: '18px' }}>
              {value}
            </p>
            <p
              className="text-muted leading-tight"
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '7px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
