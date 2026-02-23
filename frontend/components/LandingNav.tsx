'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const logoRef = useRef<HTMLAnchorElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!logoRef.current || !rightRef.current) return
    gsap.fromTo(
      logoRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' }
    )
    gsap.fromTo(
      rightRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.35, ease: 'power3.out' }
    )
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 h-16 z-[500] flex items-center px-[52px] transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(7,7,7,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--b1)' : '1px solid transparent',
      }}
    >
      <Link
        ref={logoRef}
        href="/"
        className="nav-logo font-heading text-[19px] text-text no-underline opacity-0"
      >
        <span className="text-text">Resume</span>
        <span className="text-gold italic">AI</span>
      </Link>
      <div
        ref={rightRef}
        className="nav-right ml-auto flex items-center gap-9 opacity-0"
      >
        <Link
          href="#features"
          className="font-mono text-[9px] uppercase tracking-[2px] text-muted hover:text-text transition-colors no-underline hidden md:block"
        >
          Features
        </Link>
        <Link
          href="#process"
          className="font-mono text-[9px] uppercase tracking-[2px] text-muted hover:text-text transition-colors no-underline hidden md:block"
        >
          Process
        </Link>
        <Link
          href="/login"
          className="font-mono text-[9px] uppercase tracking-[2px] text-gold border border-[rgba(201,169,110,0.3)] py-[7px] px-4 rounded-sm no-underline hover:bg-gold/10 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="font-body text-sm font-medium border border-b2 py-[7px] px-4 rounded-sm bg-transparent text-text no-underline hover:bg-gold hover:text-[#070707] transition-colors"
        >
          Get started
        </Link>
      </div>
    </nav>
  )
}
