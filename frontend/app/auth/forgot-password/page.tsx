'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import AuthTopBar from '@/components/auth/AuthTopBar'
import AuthLeftPanel from '@/components/auth/AuthLeftPanel'
import ForgotPasswordLeft from '@/components/auth/ForgotPasswordLeft'
import StepIndicator from '@/components/auth/StepIndicator'
import FormField from '@/components/auth/FormField'
import OtpInput from '@/components/auth/OtpInput'
import EmailSentCard from '@/components/auth/EmailSentCard'
import PasswordReqs from '@/components/auth/PasswordReqs'
import SuccessState from '@/components/auth/SuccessState'
import { forgotPasswordStart, confirmForgotPassword } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [timerSecs, setTimerSecs] = useState(0)

  const startResendTimer = useCallback(() => {
    setTimerSecs(60)
  }, [])

  useEffect(() => {
    if (timerSecs <= 0) return
    const t = setInterval(() => setTimerSecs((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [timerSecs])

  useEffect(() => {
    if (step !== 4) return
    const t = setTimeout(() => router.push('/auth/signin'), 5000)
    return () => clearTimeout(t)
  }, [step, router])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await forgotPasswordStart(email.trim())
      setStep(2)
      startResendTimer()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send code')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (timerSecs > 0) return
    setSubmitting(true)
    setError(null)
    try {
      await forgotPasswordStart(email.trim())
      startResendTimer()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not resend code')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await confirmForgotPassword(email.trim(), otp.join(''), newPassword)
      setStep(4)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not reset password')
    } finally {
      setSubmitting(false)
    }
  }

  const backLabel = step === 1 ? 'Back to Home' : 'Sign in'
  const backHref = step === 1 ? '/' : '/auth/signin'

  return (
    <div className="auth-page min-h-screen min-w-0 overflow-x-hidden bg-bg text-text flex flex-col">
      <AuthTopBar backLabel={backLabel} backHref={backHref} />
      <div className="flex flex-1 min-h-0">
        <AuthLeftPanel>
          <ForgotPasswordLeft step={step} />
        </AuthLeftPanel>
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-[400px]">
              {step === 1 && (
                <>
                  <StepIndicator current={1} />
                  <h2 className="font-heading text-xl text-text mt-4 mb-2">Enter your email</h2>
                  <p className="text-muted text-sm mb-4">We&apos;ll send a reset code to this address.</p>
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <FormField
                      id="email"
                      label="Email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                    {error && <p className="text-sm text-red">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-11 rounded-lg bg-gold text-bg font-medium hover:bg-gold-lt focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Send code'}
                    </button>
                  </form>
                </>
              )}
              {step === 2 && (
                <>
                  <StepIndicator current={2} />
                  <EmailSentCard email={email} />
                  <p className="text-muted text-sm mt-4 mb-2">Enter the 6-digit code from the email.</p>
                  <form onSubmit={(e) => { e.preventDefault(); setStep(3) }} className="space-y-4">
                    <OtpInput value={otp} onChange={setOtp} onComplete={() => setStep(3)} error={error || undefined} />
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
                        className="h-10 px-4 rounded-lg bg-gold text-bg font-medium hover:bg-gold-lt"
                      >
                        Continue
                      </button>
                    </div>
                  </form>
                </>
              )}
              {step === 3 && (
                <>
                  <StepIndicator current={3} />
                  <h2 className="font-heading text-xl text-text mt-4 mb-2">Set new password</h2>
                  <p className="text-muted text-sm mb-4">Choose a strong password that meets the requirements.</p>
                  <form onSubmit={handleConfirmReset} className="space-y-4">
                    <FormField
                      id="newPassword"
                      label="New password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <PasswordReqs password={newPassword} />
                    <FormField
                      id="confirmPassword"
                      label="Confirm new password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {error && <p className="text-sm text-red">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting || newPassword !== confirmPassword}
                      className="w-full h-11 rounded-lg bg-gold text-bg font-medium hover:bg-gold-lt focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Reset password'}
                    </button>
                  </form>
                </>
              )}
              {step === 4 && <SuccessState />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
