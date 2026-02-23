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
import SignUpLeft from '@/components/auth/SignUpLeft'
import FormField from '@/components/auth/FormField'
import PasswordStrength from '@/components/auth/PasswordStrength'
import PasswordMatchIndicator from '@/components/auth/PasswordMatchIndicator'
import { signupWithDetails } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'

export default function SignUpPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthdate: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const leftRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const fieldsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, isLoading, router])

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  useEffect(() => {
    if (!leftRef.current || !formRef.current) return
    gsap.fromTo(leftRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' })
    gsap.fromTo(formRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' })
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20, skewY: 2 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.8, delay: 0.2, ease: 'power4.out' }
      )
    }
    if (fieldsRef.current) {
      const targets = fieldsRef.current.querySelectorAll('.field, .field-row')
      gsap.fromTo(
        targets,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, delay: 0.25, ease: 'power3.out' }
      )
    }
  }, [isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await signupWithDetails({
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        nickname: form.firstName || '-',
        birthdate: form.birthdate,
      })
      setSuccess(result.message)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed')
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
        <AuthLeftPanel panelClassName="auth-left-panel-signup">
          <div ref={leftRef} className="h-full min-h-0 flex flex-col">
            <SignUpLeft />
          </div>
        </AuthLeftPanel>
        <div className="auth-right auth-right-signup">
          <div ref={formRef} className="auth-form-wrap auth-form-wrap-signup signup-form">
            <p
              className="mb-0"
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '9px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              New account
            </p>
            <h1 ref={titleRef} className="form-title font-heading text-text mt-0.5">
              Let&apos;s get you <em className="text-gold not-italic">set up.</em>
            </h1>
            <p className="text-muted mb-2 mt-0" style={{ fontSize: '12px' }}>
              Takes under 2 minutes.
            </p>
            <form onSubmit={handleSubmit} className="signup-form-fields" ref={fieldsRef}>
              <div className="field-row grid grid-cols-2 gap-[14px] max-sm:grid-cols-1">
                <FormField
                  id="firstName"
                  label="First Name"
                  required
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  containerClassName="col-span-1"
                />
                <FormField
                  id="lastName"
                  label="Last Name"
                  required
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  containerClassName="col-span-1"
                />
              </div>
              <div className="field-row grid grid-cols-2 gap-[14px] max-sm:grid-cols-1">
                <FormField
                  id="username"
                  label="Username"
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => update('username', e.target.value)}
                  containerClassName="col-span-1"
                />
                <FormField
                  id="birthdate"
                  label="Date of Birth"
                  type="date"
                  required
                  value={form.birthdate}
                  onChange={(e) => update('birthdate', e.target.value)}
                  containerClassName="col-span-1"
                />
              </div>
              <FormField
                id="email"
                label="Email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
              <FormField
                id="password"
                label="Password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Min 8 chars, upper, lower, num, special"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
              />
              <PasswordStrength password={form.password} />
              <FormField
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
              />
              <PasswordMatchIndicator password={form.password} confirm={form.confirmPassword} />
              {error && (
                <div className="rounded border border-red/30 bg-red/10 px-3 py-2">
                  <p className="text-sm text-red">{error}</p>
                </div>
              )}
              {success && (
                <div className="rounded border border-green/30 bg-green/10 px-3 py-2">
                  <p className="text-sm text-green">{success}</p>
                </div>
              )}
              <button type="submit" disabled={submitting} className="auth-btn-primary">
                {submitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create account →'
                )}
              </button>
            </form>
            <p className="text-center mt-2 text-muted" style={{ fontSize: '10px' }}>
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-gold hover:text-gold-lt">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-gold hover:text-gold-lt">Privacy Policy</Link>
            </p>
            <p className="text-center mt-2 text-muted" style={{ fontSize: '12px' }}>
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-gold hover:text-gold-lt">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
