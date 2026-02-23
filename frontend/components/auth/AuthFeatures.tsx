'use client'

const ITEMS = ['Username or email', 'MFA supported', 'AWS Cognito', 'Encrypted']

export default function AuthFeatures() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1px',
        background: '#1a1a1a',
        border: '1px solid #1a1a1a',
        borderRadius: '3px',
        overflow: 'hidden',
        marginTop: '24px',
      }}
    >
      {ITEMS.map((label) => (
        <div
          key={label}
          style={{
            background: '#0d0d0d',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#4a4a4a',
          }}
        >
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: '1px solid #4ade80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '7px',
              color: '#4ade80',
            }}
          >
            ✓
          </span>
          {label}
        </div>
      ))}
    </div>
  )
}
