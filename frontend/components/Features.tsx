'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const cards = [
  {
    num: '01',
    title: 'Job-Specific Tailoring',
    tag: 'Core',
    description: 'Paste any job description. AI maps requirements to your profile and rewrites bullets so you match what employers screen for.',
  },
  {
    num: '02',
    title: 'Instant Generation',
    tag: 'Speed',
    description: 'Generate a tailored, ATS-optimised résumé in under a minute. No manual reformatting—focus on applying.',
  },
  {
    num: '03',
    title: "ATS-Proof Output — built on Jake's industry-proven template",
    tag: 'Reliability',
    description: 'Structured LaTeX and clean PDFs that pass applicant tracking systems. The same template trusted by thousands of engineers.',
  },
  {
    num: '04',
    title: 'AI Content Enhancement',
    tag: 'Writing',
    description: 'Bullets are rewritten to be impactful and action-oriented while staying truthful to your experience.',
  },
  {
    num: '05',
    title: 'Multiple Export Formats',
    tag: 'Flexible',
    description: 'PDF for applications, LaTeX source for tweaks, and more. One profile, every format you need.',
  },
]

export default function Features() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = trackRef.current?.querySelectorAll('.feat-card')
    if (!els?.length) return
    gsap.fromTo(
      els,
      { opacity: 0, x: 60 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top 80%',
        },
      }
    )
    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <section className="border-t border-b1 py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <h2 className="font-heading text-3xl md:text-4xl text-text">
            Everything you need to get{' '}
            <span className="text-gold italic">hired.</span>
          </h2>
          <p className="font-body text-sm text-muted max-w-[300px] md:text-right">
            One profile. Any job. ATS-optimised PDFs and LaTeX in seconds.
          </p>
        </div>
        <div
          ref={trackRef}
          className="features-track flex flex-col min-[600px]:flex-row gap-px bg-b1 border border-b1 rounded overflow-x-auto min-[600px]:overflow-visible"
          style={{ scrollbarWidth: 'none' }}
        >
          {cards.map((card) => (
            <div
              key={card.num}
              className="feat-card flex-shrink-0 w-full min-[600px]:w-[85vw] md:w-[calc(20%-1px)] bg-s1 p-8 md:py-11 md:px-9 relative before:absolute before:left-0 before:right-0 before:top-0 before:h-px before:bg-gold before:opacity-0 hover:before:opacity-100 hover:bg-s2 transition-colors before:transition-opacity"
            >
              <div className="font-heading text-[56px] text-muted2 italic leading-none mb-4">
                {card.num}
              </div>
              <h3 className="font-body text-[15px] font-semibold text-text mb-2">
                {card.title}
              </h3>
              <p className="font-body text-[13px] text-muted leading-[1.7] mb-4">
                {card.description}
              </p>
              <span className="inline-block font-mono text-xs border border-b2 text-gold py-1.5 px-2.5 rounded-sm">
                {card.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
