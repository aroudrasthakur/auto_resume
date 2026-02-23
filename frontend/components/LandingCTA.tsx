'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function LandingCTA() {
  const headRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!headRef.current) return
    gsap.fromTo(
      headRef.current,
      { opacity: 0, y: 80, skewY: 2 },
      {
        opacity: 1,
        y: 0,
        skewY: 0,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: headRef.current,
          start: 'top 80%',
        },
      }
    )
    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <section className="relative overflow-hidden py-20 md:py-[140px] px-6 md:px-20 text-center">
      {/* Orbs */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none opacity-100"
        style={{
          background: 'radial-gradient(circle, rgba(201,169,110,0.08), transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(80px)',
          animation: 'orbFloat 12s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.05]"
        style={{
          background: 'radial-gradient(circle, rgba(201,169,110,0.2), transparent 70%)',
          top: '30%',
          left: '20%',
          filter: 'blur(80px)',
          animation: 'orbFloat 12s ease-in-out infinite',
          animationDelay: '-4s',
        }}
      />
      <div
        className="absolute w-[250px] h-[250px] rounded-full pointer-events-none opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, rgba(201,169,110,0.2), transparent 70%)',
          bottom: '20%',
          right: '15%',
          filter: 'blur(80px)',
          animation: 'orbFloat 12s ease-in-out infinite',
          animationDelay: '-8s',
        }}
      />

      <div className="relative z-10">
        <h2
          id="cta-head"
          ref={headRef}
          className="font-heading text-text opacity-0 mb-6"
          style={{
            fontSize: 'clamp(44px, 7vw, 110px)',
            letterSpacing: '-3.5px',
            lineHeight: 0.95,
          }}
        >
          Stop sending the same résumé to{' '}
          <span className="text-gold italic">every job.</span>
        </h2>
        <p className="font-body text-[15px] text-muted leading-[1.7] max-w-[400px] mx-auto mb-8">
          One profile. Paste the job. Get a tailored, ATS-optimised PDF. Start in under two minutes.
        </p>
        <Link
          href="/signup"
          className="inline-block font-body text-sm font-semibold bg-gold text-[#070707] py-4 px-9 rounded-sm hover:-translate-y-0.5 transition-transform"
        >
          Get started free
        </Link>
        <p className="font-mono text-[9px] uppercase text-muted2 mt-6">
          No credit card · Free to start · Takes 2 minutes
        </p>
      </div>
    </section>
  )
}
