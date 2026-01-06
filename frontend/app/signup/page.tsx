'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Loader2, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import { signupWithDetails } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'

export default function SignupPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    nickname: '',
    birthdate: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    setError(null)
    setSuccess(null)
  }, [form])

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const passwordValid = form.password.length >= 8 && /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) && /\d/.test(form.password) && /[!@#$%^&*(),.?":{}|<>]/.test(form.password)
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!passwordValid) {
      setError('Password must be 8+ chars with uppercase, lowercase, number, and special character')
      return
    }
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await signupWithDetails(form)
      setSuccess(result.message)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-fuchsia-950/20 pointer-events-none" />
      
      {/* Compact Header */}
      <header className="relative z-10 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-semibold text-white">ResumeAI</span>
        </Link>
      </header>

      {/* Main Content - Fills remaining space */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-2 min-h-0">
        <div className="w-full max-w-[720px]">
          {/* Compact Heading */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
          </div>

          {/* Card */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xl shadow-black/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Username, Email, Nickname */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="username" className="block text-xs font-medium text-slate-400 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={form.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    placeholder="johndoe"
                    className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="john@example.com"
                    className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="nickname" className="block text-xs font-medium text-slate-400 mb-1">
                    Nickname
                  </label>
                  <input
                    id="nickname"
                    type="text"
                    required
                    autoComplete="nickname"
                    value={form.nickname}
                    onChange={(e) => updateField('nickname', e.target.value)}
                    placeholder="Johnny"
                    className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Row 2: First Name, Last Name, Birthdate */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-medium text-slate-400 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    placeholder="John"
                    className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-slate-400 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Doe"
                    className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="birthdate" className="block text-xs font-medium text-slate-400 mb-1">
                    Birthdate
                  </label>
                  <input
                    id="birthdate"
                    type="date"
                    required
                    autoComplete="bday"
                    value={form.birthdate}
                    onChange={(e) => updateField('birthdate', e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Min 8 chars, upper, lower, num, special"
                      className={`w-full h-10 px-3 pr-10 rounded-md bg-slate-800 border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                        form.password.length > 0 ? (passwordValid ? 'border-emerald-500/50' : 'border-amber-500/50') : 'border-slate-700'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-400 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full h-10 px-3 pr-10 rounded-md bg-slate-800 border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                        form.confirmPassword.length > 0 ? (passwordsMatch ? 'border-emerald-500/50' : 'border-red-500/50') : 'border-slate-700'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline Password Status */}
              <div className="flex items-center gap-4 text-xs">
                <div className={`flex items-center gap-1 ${passwordValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {passwordValid ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>Password strength</span>
                </div>
                <div className={`flex items-center gap-1 ${form.confirmPassword.length > 0 ? (passwordsMatch ? 'text-emerald-400' : 'text-red-400') : 'text-slate-500'}`}>
                  {form.confirmPassword.length > 0 && passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>Passwords match</span>
                </div>
              </div>

              {/* Error / Success Messages */}
              {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400">{success}</p>
                  <Link href="/login" className="text-xs text-emerald-300 hover:text-emerald-200 underline mt-1 inline-block">
                    Continue to sign in →
                  </Link>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !passwordValid || !passwordsMatch}
                className="w-full h-10 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-sm hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                Sign in
              </Link>
            </p>
            <span className="text-slate-700">•</span>
            <Link href="/terms" className="text-violet-400 hover:text-violet-300">Terms</Link>
            <span className="text-slate-700">•</span>
            <Link href="/privacy" className="text-violet-400 hover:text-violet-300">Privacy</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
