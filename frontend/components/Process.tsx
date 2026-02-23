'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    title: 'Build your profile once',
    description:
      "Add your experience, education, projects, and skills. You do this once — AI handles everything after.",
  },
  {
    title: "Paste the job description",
    description:
      "AI reads what the employer is screening for and maps it against your profile.",
  },
  {
    title: 'Download and apply',
    description:
      "A tailored, ATS-optimised résumé as a print-ready PDF. Repeat for every role with zero extra effort.",
  },
]

export default function Process() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stepEls = gridRef.current?.querySelectorAll('[data-step]')
    if (!stepEls?.length) return
    stepEls.forEach((step, i) => {
      gsap.fromTo(
        step,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: i * 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
          },
        }
      )
    })
    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <section
      id="process"
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-[280px_1fr] border-t border-b1 border-b border-b1"
    >
      <div className="hidden md:flex flex-col justify-between border-b1 border-r py-20 px-10">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[2px] text-gold mb-3">
            The process
          </div>
          <h2 className="font-heading text-[32px] text-text leading-tight">
            Three steps.{' '}
            <span className="text-gold italic">One résumé.</span>
          </h2>
        </div>
        <div
          className="font-mono text-[8px] text-muted2 uppercase"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Resume · AI · 2026
        </div>
      </div>
      <div className="md:min-w-0">
        {steps.map((step, i) => (
          <div
            key={i}
            data-step
            className="group grid grid-cols-[72px_1fr] border-b border-b1 last:border-b-0 cursor-default"
          >
            <div className="flex items-center justify-center border-b1 border-r font-heading text-[36px] text-muted2 italic transition-colors py-6 group-hover:text-gold">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="py-8 px-6 md:py-10 md:px-12">
              <h3 className="font-body text-base font-semibold text-text mb-2">
                {step.title}
              </h3>
              <p className="font-body text-[13px] text-muted leading-[1.7]">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
