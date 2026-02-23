'use client'

const items = [
  'Username or email',
  'MFA supported',
  'AWS Cognito',
  'Encrypted',
]

export default function AuthFeatures() {
  return (
    <div
      className="grid grid-cols-2 gap-4 auth-features-grid"
      style={{
        borderTop: '1px solid var(--b1)',
        paddingTop: '24px',
        marginTop: '24px',
      }}
    >
      {items.map((text) => (
        <div key={text} className="flex items-center gap-2">
          <span
            className="shrink-0 rounded-full border border-green flex items-center justify-center text-green"
            style={{ width: 14, height: 14, fontSize: '7px', lineHeight: 1 }}
            aria-hidden
          >
            ✓
          </span>
          <span className="text-muted" style={{ fontSize: '12px' }}>
            {text}
          </span>
        </div>
      ))}
    </div>
  )
}
