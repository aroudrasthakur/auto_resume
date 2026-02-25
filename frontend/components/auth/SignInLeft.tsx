'use client'

const STATS = [
  { val: '2×', lbl: 'More callbacks' },
  { val: '<60s', lbl: 'To generate' },
  { val: 'ATS', lbl: 'Optimised output' },
  { val: "Jake's", lbl: 'Template standard' },
]

export default function SignInLeft() {
  return (
    <div className="signin-left flex flex-col justify-between h-full min-h-0">
      <div className="relative z-[1] flex flex-col justify-between h-full min-h-0">
        {/* Top: eyebrow + headline + sub */}
        <div className="min-h-0 shrink">
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#c9a96e',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '28px',
            }}
          >
            <span style={{ width: '24px', height: '1px', background: '#c9a96e', display: 'block', flexShrink: 0 }} />
            Welcome Back
          </div>
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 'clamp(36px, 4vw, 56px)',
              letterSpacing: '-2px',
              lineHeight: '1.0',
              color: '#f0ede8',
              marginBottom: '16px',
            }}
          >
            Your next role is <em style={{ color: '#c9a96e', fontStyle: 'italic' }}>one paste</em> away.
          </h1>
          <p style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: 1.7, maxWidth: '320px' }}>
            Sign in to access your profile and generate tailored résumés for every job you apply to.
          </p>
        </div>

        {/* Middle: pulsing label + resume card */}
        <div className="my-6 shrink-0">
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '8px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#2e2e2e',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#4ade80',
                animation: 'pd 2s ease-in-out infinite',
              }}
              aria-hidden
            />
            Last Generated · 2h Ago
          </div>
          <div
            className="rp-card"
            style={{
              background: '#f9f7f3',
              borderRadius: '3px',
              padding: '18px 22px',
              boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
            }}
          >
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '15px', color: '#111' }}>Alexandra Chen</p>
            <p style={{ fontSize: '10px', color: '#666', marginBottom: '12px' }}>Senior Software Engineer</p>
            <div style={{ height: '1px', background: '#e8e4de', margin: '12px 0' }} />
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px', fontSize: '9.5px', color: '#555' }}>
              <li style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                <span style={{ color: '#c9a96e' }}>—</span> Led ML pipeline dev, reduced latency 40%
              </li>
              <li style={{ display: 'flex', gap: '6px' }}>
                <span style={{ color: '#c9a96e' }}>—</span> Architected system for 2M+ daily users
              </li>
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Python', 'React', 'AWS', 'Go'].map((s) => (
                <span
                  key={s}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '7.5px',
                    background: '#f0ede8',
                    color: '#777',
                    borderRadius: '2px',
                    padding: '2px 7px',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: 2×2 stats grid (gap+bg divider pattern) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            background: '#1a1a1a',
            border: '1px solid #1a1a1a',
            borderRadius: '3px',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {STATS.map(({ val, lbl }) => (
            <div key={lbl} style={{ background: '#0d0d0d', padding: '16px 18px' }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', letterSpacing: '-1px', color: '#c9a96e' }}>{val}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#4a4a4a', marginTop: '2px' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
