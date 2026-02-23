'use client'

type StepIndicatorProps = {
  current: number
  total?: number
}

export default function StepIndicator({ current, total = 3 }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 w-6 rounded-full transition-colors ${
              i + 1 <= current ? 'bg-gold' : 'bg-b2'
            }`}
          />
        ))}
      </div>
      <span>Step {current} of {total}</span>
    </div>
  )
}