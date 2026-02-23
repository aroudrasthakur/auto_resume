'use client'

type PasswordStrengthProps = {
  password: string
}

function getStrength(password: string): { score: number; color: string } {
  if (!password) return { score: 0, color: 'var(--b2)' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const colors = ['var(--b2)', 'var(--red)', 'var(--gold)', 'var(--green)', 'var(--green)']
  return {
    score: Math.min(4, score),
    color: colors[score] || 'var(--green)',
  }
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, color } = getStrength(password)
  return (
    <div
      className="mt-1 flex items-center gap-2"
      style={{
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '9px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: 'var(--muted)',
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
      <span>STRENGTH</span>
    </div>
  )
}
