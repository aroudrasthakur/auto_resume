'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: '2×', label: 'More callbacks' },
  { value: '<60s', label: 'To generate' },
  { value: '100%', label: 'ATS compatible' },
  { value: 'PDF', label: 'LaTeX quality output' },
]

export default function StatsStrip() {
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cells = stripRef.current?.querySelectorAll('.stat-cell')
    if (!cells?.length) return
    gsap.fromTo(
      cells,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: stripRef.current,
          start: 'top 85%',
        },
      }
    )
    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <div
      ref={stripRef}
      className="stats-strip grid grid-cols-2 md:grid-cols-4 gap-px bg-b1"
    >
      {stats.map(({ value, label }) => (
        <div
          key={label}
          className="stat-cell bg-s1 py-9 px-8 md:px-10 hover:bg-[#101010] transition-colors"
        >
          <div
            className="font-heading text-gold text-[42px] leading-none tracking-[-2px]"
          >
            {value}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[2px] text-muted mt-1">
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
