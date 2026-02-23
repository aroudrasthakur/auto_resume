'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const tagRef = useRef<HTMLDivElement>(null)
  const wordsRef = useRef<HTMLSpanElement[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollIndRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(
      tagRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.9, delay: 0.5, ease: 'power3.out' }
    )

    const words = wordsRef.current.filter(Boolean)
    gsap.fromTo(
      words,
      { opacity: 0, y: 60, skewY: 3 },
      { opacity: 1, y: 0, skewY: 0, duration: 1, delay: 0.7, stagger: 0.15, ease: 'power4.out' }
    )

    gsap.fromTo(
      bottomRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 1.1, ease: 'power3.out' }
    )
    gsap.fromTo(
      scrollIndRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, delay: 1.8, ease: 'power2.out' }
    )

    gsap.fromTo(
      rightRef.current,
      { opacity: 0, x: 40 },
      { opacity: 1, x: 0, duration: 1.1, delay: 0.9, ease: 'power3.out' }
    )
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30, rotation: 1 },
      { opacity: 1, y: 0, rotation: 0, duration: 1.2, delay: 1.1, ease: 'power3.out' }
    )

    gsap.to(cardRef.current, {
      y: -8,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 2.5,
    })

    const trigger = heroRef.current
    const headline = headlineRef.current
    if (trigger && headline) {
      gsap.to(headline, {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  const line1 = ['Your', 'résumé,']
  const line2 = ['tailored']
  const line3 = ['for', 'every', 'job.']
  let wordIndex = 0

  return (
    <section
      ref={heroRef}
      className="hero grid grid-cols-1 md:grid-cols-2 min-h-screen min-w-0 pt-16 border-b border-b1"
    >
      {/* Left column */}
      <div className="relative flex min-w-0 flex-col justify-between py-[72px] pl-[80px] pr-16 md:pr-16 md:border-r border-b1 max-lg:pl-12 max-lg:pr-10 max-md:px-8 max-md:py-12 max-md:border-r-0 max-md:border-b border-b1">
        <div id="hero-tag" ref={tagRef} className="flex items-center gap-3 opacity-0">
          <span
            className="w-8 h-px shrink-0 bg-gold"
            aria-hidden
          />
          <span className="font-mono text-[9px] uppercase tracking-[3px] text-gold">
            AI-Powered Career Intelligence
          </span>
        </div>

        <div ref={headlineRef} className="hero-headline flex flex-col gap-[0.15em]">
          <div className="line overflow-hidden leading-[1.1]">
            {line1.map((w) => (
              <span
                key={w}
                ref={(el) => {
                  if (el) wordsRef.current[wordIndex++] = el
                }}
                className="word inline-block font-heading text-text mr-[0.12em]"
                style={{
                  fontSize: 'clamp(44px, 5.5vw, 96px)',
                  letterSpacing: '-3px',
                }}
              >
                {w}
              </span>
            ))}
          </div>
          <div
            className="line overflow-hidden leading-[1.1]"
            style={{ paddingLeft: 'clamp(32px, 5vw, 80px)' }}
          >
            {line2.map((w) => (
              <span
                key={w}
                ref={(el) => {
                  if (el) wordsRef.current[wordIndex++] = el
                }}
                className="word inline-block font-heading text-gold italic mr-[0.12em]"
                style={{
                  fontSize: 'clamp(44px, 5.5vw, 96px)',
                  letterSpacing: '-3px',
                }}
              >
                {w}
              </span>
            ))}
          </div>
          <div className="line overflow-hidden leading-[1.1]">
            {line3.map((w) => (
              <span
                key={w}
                ref={(el) => {
                  if (el) wordsRef.current[wordIndex++] = el
                }}
                className="word inline-block font-heading text-muted mr-[0.12em]"
                style={{
                  fontSize: 'clamp(26px, 3.2vw, 58px)',
                  letterSpacing: '-3px',
                }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        <div id="hero-bottom" ref={bottomRef} className="flex flex-col gap-6 max-w-[420px] opacity-0">
          <p className="font-body text-[15px] text-muted leading-[1.75]">
            Enter your experience once. Let AI tailor your resume for each job.
            Generate professional LaTeX PDFs that pass applicant tracking systems.
          </p>
          <div className="jake-badge inline-flex w-fit font-mono text-[9px] text-muted border border-b2 py-1.5 px-3 rounded-sm bg-gold/5">
            <span className="text-gold">★</span> Built on Jake&apos;s Resume Template — trusted by 10,000+ engineers
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="font-body text-sm font-semibold bg-gold text-[#070707] py-[15px] px-8 rounded-sm hover:-translate-y-0.5 transition-transform"
            >
              Get started
            </Link>
            <Link
              href="#process"
              className="font-mono text-[9px] uppercase text-muted hover:text-text transition-colors flex items-center gap-1"
            >
              How it works
              <span aria-hidden>↓</span>
            </Link>
          </div>
        </div>

        <div
          id="scroll-ind"
          ref={scrollIndRef}
          className="absolute bottom-8 left-[80px] font-mono text-[8px] uppercase text-muted2 opacity-0 max-md:left-8 flex items-center gap-2"
        >
          <span className="relative inline-block h-px w-16 overflow-hidden rounded bg-muted2">
            <span
              className="absolute top-0 h-full w-1/3 bg-gold animate-[scrollLine_2s_infinite]"
              style={{ animationTimingFunction: 'ease-in-out' }}
            />
          </span>
          <span>Scroll</span>
        </div>
      </div>

      {/* Right column — Resume mockup */}
      <div
        id="hero-right"
        ref={rightRef}
        className="relative min-w-0 bg-s1 p-12 md:p-[52px] overflow-hidden max-lg:p-8 max-md:p-8"
      >
        <div
          className="absolute inset-0 opacity-40 z-0 before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(var(--b1)_1px,transparent_1px),linear-gradient(90deg,var(--b1)_1px,transparent_1px)] before:bg-[length:40px_40px]"
          aria-hidden
        />
        <div className="relative z-10 flex min-w-0 flex-col gap-4">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-gold animate-[pulseDot_2s_ease-in-out_infinite]"
              aria-hidden
            />
            <span className="font-mono text-[9px] text-muted">
              AI-generated · tailored for this role
            </span>
          </div>
          <div className="bg-bg border border-b2 rounded-md py-3 px-4 flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted">
              Paste job description or URL
              <span className="inline-block w-px h-3 align-middle bg-gold ml-0.5 animate-[blink_1s_step-end_infinite]" aria-hidden />
            </span>
            <button
              type="button"
              className="font-mono text-[9px] text-gold bg-gold/10 py-1 px-2 rounded-sm border border-b2"
            >
              Generate →
            </button>
          </div>
          <div className="relative min-w-0 overflow-hidden">
            <div
              id="resume-card"
              ref={cardRef}
              className="bg-[#f9f7f3] min-w-0 max-w-full rounded-md shadow-xl p-6 md:p-[24px] md:pt-[28px] overflow-hidden"
              style={{
                boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <div className="ats-badge absolute -top-3 right-4 md:right-6 bg-[#070707] border border-gold font-mono text-[8px] text-gold py-1 px-2.5 rounded-sm z-10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-[pulseDot_2s_ease-in-out_infinite]" />
                ATS Score: 97%
              </div>
              <div className="font-heading text-[19px] text-[#111]">Alexandra Chen</div>
              <div className="font-body text-xs font-semibold text-[#444]">Senior Software Engineer</div>
              <div className="font-mono text-[8.5px] text-[#888] mt-0.5">SF · email · github</div>
              <div className="h-px bg-[#e8e4de] my-3" />
              <div className="font-mono text-[8px] tracking-[2.5px] text-[#aaa] uppercase mb-2">Experience</div>
              <div className="space-y-1.5 text-[#333]">
                <div className="font-body text-xs">
                  <span className="font-semibold">Google</span> — Senior Software Engineer
                  <span className="float-right text-[#888]">2021–Present</span>
                </div>
                <ul className="font-body text-[11px] text-[#555] pl-3 space-y-0.5">
                  <li><span className="text-gold">—</span> Led ML pipeline dev reducing latency by 40%</li>
                  <li><span className="text-gold">—</span> Architected system for 2M+ daily active users</li>
                  <li><span className="text-gold">—</span> Mentored 4 engineers; drove React adoption</li>
                </ul>
                <div className="font-body text-xs pt-1">
                  <span className="font-semibold">Stripe</span> — Software Engineer
                  <span className="float-right text-[#888]">2019–2021</span>
                </div>
                <div className="font-body text-[11px] text-[#555] pl-3">
                  <span className="text-gold">—</span> Built payment flow processing $50M+/month
                </div>
              </div>
              <div className="h-px bg-[#e8e4de] my-3" />
              <div className="font-mono text-[8px] tracking-[2.5px] text-[#aaa] uppercase mb-2">Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {['Python', 'React', 'TypeScript', 'AWS', 'Go', 'ML'].map((s) => (
                  <span
                    key={s}
                    className="font-mono text-[8.5px] bg-[#f0ede8] text-[#333] py-0.5 px-1.5 rounded-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="font-mono text-[8.5px] text-muted2 uppercase">
            <span className="text-gold">★</span> Jake&apos;s Resume Template
          </div>
        </div>
      </div>
    </section>
  )
}
