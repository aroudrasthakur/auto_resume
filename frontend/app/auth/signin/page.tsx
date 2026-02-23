'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import gsap from 'gsap'
import WaveCanvas from '@/components/WaveCanvas'
import Cursor from '@/components/Cursor'
import AuthTopBar from '@/components/auth/AuthTopBar'
import AuthLeftPanel from '@/components/auth/AuthLeftPanel'
import SignInLeft from '@/components/auth/SignInLeft'
import FormField from '@/components/auth/FormField'
import AuthFeatures from '@/components/auth/AuthFeatures'
import { loginWithCredentials } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'

export default function SignInPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const leftRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const fieldsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    setError(null)
  }, [identifier, password])

  useEffect(() => {
    if (!leftRef.current || !formRef.current) return
    gsap.fromTo('.signin-left', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' })
    gsap.fromTo('.rp-card', { opacity: 0, y: 20, rotation: 0.5 }, { opacity: 1, y: 0, rotation: 0, duration: 0.9, delay: 0.4, ease: 'power3.out' })
    gsap.to('.rp-card', { y: -6, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 })
    gsap.fromTo('.signin-form', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' })
    gsap.fromTo('.form-title', { opacity: 0, y: 20, skewY: 2 }, { opacity: 1, y: 0, skewY: 0, duration: 0.8, delay: 0.2, ease: 'power4.out' })
    gsap.fromTo('.field', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 0.3, ease: 'power3.out' })
  }, [isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const tokens = await loginWithCredentials(identifier.trim(), password)
      login(tokens)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="auth-page min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="auth-page min-w-0 overflow-x-hidden overflow-y-hidden bg-bg text-text flex flex-col h-screen">
      <WaveCanvas />
      <Cursor />
      <AuthTopBar />
      <div className="auth-layout">
        <AuthLeftPanel panelClassName="auth-left-panel-signin">
          <div ref={leftRef} className="h-full min-h-0 flex flex-col">
            <SignInLeft />
          </div>
        </AuthLeftPanel>
        <div className="auth-right">
          <div ref={formRef} className="auth-form-wrap signin-form">
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
                marginBottom: '16px',
              }}
            >
              <span style={{ width: '20px', height: '1px', background: '#c9a96e', display: 'block' }} />
              Sign In
            </div>
            <h1
              ref={titleRef}
              className="form-title"
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '36px',
                letterSpacing: '-1.5px',
                lineHeight: '1.05',
                color: '#f0ede8',
                marginBottom: '8px',
              }}
            >
              Good to have you <em style={{ color: '#c9a96e', fontStyle: 'italic' }}>back.</em>
            </h1>
            <p className="text-muted mb-6" style={{ fontSize: '13px' }}>
              Enter your credentials to access your dashboard.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4" ref={fieldsRef}>
              <FormField
                id="identifier"
                label="Username"
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Use the username you signed up with"
              />
              <FormField
                id="password"
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                labelRight={
                  <Link href="/auth/forgot-password" className="text-gold hover:text-gold-lt text-[9px] uppercase" style={{ letterSpacing: '2px' }}>
                    Forgot password?
                  </Link>
                }
              />
              {error && (
                <div className="rounded border border-red/30 bg-red/10 px-3 py-2">
                  <p className="text-sm text-red">{error}</p>
                </div>
              )}
              <button type="submit" disabled={submitting} className="auth-btn-primary">
                {submitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign in →'
                )}
              </button>
              <AuthFeatures />
            </form>
            <p className="text-center mt-6 text-muted" style={{ fontSize: '13px' }}>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-gold hover:text-gold-lt">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
