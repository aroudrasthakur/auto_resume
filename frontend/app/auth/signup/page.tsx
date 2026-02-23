'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import gsap from 'gsap'
import WaveCanvas from '@/components/WaveCanvas'
import Cursor from '@/components/Cursor'
import AuthTopBar from '@/components/auth/AuthTopBar'
import AuthLeftPanel from '@/components/auth/AuthLeftPanel'
import SignUpLeft from '@/components/auth/SignUpLeft'
import FormField from '@/components/auth/FormField'
import PasswordStrength from '@/components/auth/PasswordStrength'
import PasswordMatchIndicator from '@/components/auth/PasswordMatchIndicator'
import StepIndicator from '@/components/auth/StepIndicator'
import EmailSentCard from '@/components/auth/EmailSentCard'
import OtpInput from '@/components/auth/OtpInput'
import { signupWithDetails, confirmSignUp, resendSignUpCode } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'

export default function SignUpPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [signupEmail, setSignupEmail] = useState('')
  const [signupUsername, setSignupUsername] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [timerSecs, setTimerSecs] = useState(0)
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

  const startResendTimer = useCallback(() => {
    setTimerSecs(60)
  }, [])

  useEffect(() => {
    if (timerSecs <= 0) return
    const t = setInterval(() => setTimerSecs((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [timerSecs])

  useEffect(() => {
    if (step !== 3) return
    const t = setTimeout(() => router.push('/login'), 4000)
    return () => clearTimeout(t)
  }, [step, router])

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, isLoading, router])

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  useEffect(() => {
    gsap.fromTo('.signup-left', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' })
    gsap.fromTo('.step-row-item', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, delay: 0.35, ease: 'power3.out' })
    gsap.fromTo('.signup-form', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' })
    gsap.fromTo('.signup-form .form-title', { opacity: 0, y: 20, skewY: 2 }, { opacity: 1, y: 0, skewY: 0, duration: 0.8, delay: 0.2, ease: 'power4.out' })
    gsap.fromTo('.signup-form .field, .signup-form .field-row', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, delay: 0.25, ease: 'power3.out' })
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
      if (!result.user_confirmed) {
        setSignupUsername(form.username)
        setSignupEmail(form.email)
        setOtp(Array(6).fill(''))
        startResendTimer()
        setStep(2)
      } else {
        setSuccess(result.message)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) return
    setSubmitting(true)
    setError(null)
    try {
      await confirmSignUp({ username: signupUsername, confirmationCode: code })
      setStep(3)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (timerSecs > 0) return
    setSubmitting(true)
    setError(null)
    try {
      await resendSignUpCode(signupUsername)
      startResendTimer()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not resend code')
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
      <AuthTopBar
        backLabel={step === 2 ? 'Back to form' : 'Back to Home'}
        backHref={step === 2 ? '#' : '/'}
        onBackClick={step === 2 ? () => setStep(1) : undefined}
      />
      <div className="auth-layout">
        <AuthLeftPanel panelClassName="auth-left-panel-signup">
          <div ref={leftRef} className="h-full min-h-0 flex flex-col">
            <SignUpLeft />
          </div>
        </AuthLeftPanel>
        <div className="auth-right auth-right-signup">
          <div ref={formRef} className="auth-form-wrap auth-form-wrap-signup signup-form">
            {step === 1 && (
              <>
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
              </>
            )}
            {step === 2 && (
              <>
                <StepIndicator current={2} total={2} />
                <h1 className="form-title font-heading text-text mt-4 mb-2">
                  Verify your <em className="text-gold not-italic">email</em>
                </h1>
                <p className="text-muted mb-4" style={{ fontSize: '12px' }}>
                  We sent a 6-digit code to your inbox.
                </p>
              </>
            )}
            {step === 3 && (
              <div className="text-center py-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold text-gold mb-4">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="font-heading text-xl text-text mb-1">
                  Account <em className="text-gold not-italic">verified.</em>
                </h3>
                <p className="text-sm text-muted">Redirecting you to sign in...</p>
              </div>
            )}
            {step === 1 && (
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
            )}
            {step === 2 && (
              <div className="signup-form-fields">
                <EmailSentCard email={signupEmail} />
                <form onSubmit={handleVerify} className="space-y-4 mt-4">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    error={error || undefined}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={timerSecs > 0 || submitting}
                      className="text-sm text-gold hover:text-gold-lt disabled:text-muted disabled:cursor-not-allowed"
                    >
                      {timerSecs > 0 ? `Resend in ${timerSecs}s` : 'Resend code'}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || otp.join('').length !== 6}
                      className="h-10 px-6 rounded-lg bg-gold text-bg font-medium hover:bg-gold-lt focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {step !== 3 && (
              <>
                <p className="text-center mt-2 text-muted" style={{ fontSize: '10px' }}>
                  By creating an account you agree to our{' '}
                  <Link href="/terms" className="text-gold hover:text-gold-lt">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-gold hover:text-gold-lt">Privacy Policy</Link>
                </p>
                <p className="text-center mt-2 text-muted" style={{ fontSize: '12px' }}>
                  Already have an account?{' '}
                  <Link href="/login" className="text-gold hover:text-gold-lt">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
