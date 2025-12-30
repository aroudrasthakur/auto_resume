'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { exchangeCodeForTokens } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (errorParam) {
      setError(errorDescription || errorParam)
      setStatus('error')
      return
    }

    if (!code) {
      setError('No authorization code received. Please try signing in again.')
      setStatus('error')
      return
    }

    // Exchange code for tokens
    exchangeCodeForTokens(code)
      .then((tokens) => {
        login(tokens)
        setStatus('success')
        // Brief delay to show success state
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      })
      .catch((err) => {
        console.error('Token exchange error:', err)
        setError('Failed to complete authentication. Please try again.')
        setStatus('error')
      })
  }, [searchParams, login, router])

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Authentication Failed</h1>
          <p className="text-slate-400 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/login"
              className="inline-flex justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all"
            >
              Try Sign In
            </a>
            <a
              href="/login?signup=true"
              className="inline-flex justify-center px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800/50 hover:border-slate-600 transition-all"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-6">
        <div className="text-center">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              ResumeAI
            </span>
          </div>

          {/* Success State */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white mb-1">Welcome!</h1>
              <p className="text-slate-400">Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-6">
      <div className="text-center">
        {/* Logo */}
        <div className="inline-flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            ResumeAI
          </span>
        </div>

        {/* Loading State */}
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
          <div>
            <h1 className="text-xl font-semibold text-white mb-1">Signing you in...</h1>
            <p className="text-slate-400">Please wait while we complete authentication</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              ResumeAI
            </span>
          </div>
          <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
