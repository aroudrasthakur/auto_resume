'use client'

type PasswordStrengthProps = {
  password: string
}

// Strong = only when all 4 criteria are met (length ≥8, upper, number, special)
const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const
const COLORS = ['var(--b2)', 'var(--red)', 'var(--gold)', 'var(--green)', 'var(--green)'] as const

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: 'Weak', color: COLORS[1] }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const s = Math.min(4, score)
  return {
    score: s,
    label: LABELS[s] ?? '',
    color: COLORS[s] ?? COLORS[0],
  }
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, color } = getStrength(password)
  return (
    <div
      className="mt-1 flex items-center gap-2"
      style={{
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '9px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
      }}
    >
      <div className="flex gap-0.5 flex-1" style={{ maxWidth: 72 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-0.5 flex-1 rounded-sm"
            style={{
              backgroundColor: i <= score ? color : 'var(--b2)',
            }}
          />
        ))}
      </div>
      <span style={{ color }}>{label}</span>
    </div>
  )
}
