'use client'

const items = [
  'ATS Optimised',
  'LaTeX PDF Output',
  "Jake's Resume Template",
  'Job-Specific Tailoring',
  'AI Content Rewriting',
  'Instant Generation',
  'Multiple Formats',
  'Privacy-First',
]

const separator = (
  <span className="text-gold px-2" aria-hidden>
    ◆
  </span>
)

export default function TickerStrip() {
  const row = (
    <>
      {items.map((label, i) => (
        <span key={i} className="whitespace-nowrap flex items-center">
          {label}
          {separator}
        </span>
      ))}
    </>
  )

  return (
    <div className="ticker relative h-14 bg-b1 border-y border-b2 overflow-hidden">
      <div
        className="absolute left-0 top-0 w-24 h-full z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, var(--b1), transparent)',
        }}
      />
      <div
        className="absolute right-0 top-0 w-24 h-full z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(-90deg, var(--b1), transparent)',
        }}
      />
      <div className="flex items-center h-full ticker-animation whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[2px] text-text">
        <span className="inline-flex items-center py-0 px-8">{row}</span>
        <span className="inline-flex items-center py-0 px-8">{row}</span>
      </div>
    </div>
  )
}
