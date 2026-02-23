'use client'

type PasswordMatchIndicatorProps = {
  password: string
  confirm: string
}

export default function PasswordMatchIndicator({ password, confirm }: PasswordMatchIndicatorProps) {
  if (!confirm) return null
  const match = password === confirm && password.length > 0
  const dotColor = !confirm ? 'var(--muted2)' : match ? 'var(--green)' : 'var(--red)'
  return (
    <div
      className="mt-1 flex items-center gap-2"
      style={{
        fontFamily: 'var(--font-mono), monospace',
        fontSize: '9px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: match ? 'var(--green)' : 'var(--red)',
      }}
    >
      <span
        className="shrink-0 rounded-full"
        style={{ width: 5, height: 5, backgroundColor: dotColor }}
        aria-hidden
      />
      <span>{match ? 'Passwords match' : 'Passwords do not match'}</span>
    </div>
  )
}
