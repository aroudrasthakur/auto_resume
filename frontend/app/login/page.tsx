'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, ArrowLeft, Loader2, Mail, User, KeyRound } from 'lucide-react'
import { getLoginUrl } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  
  const isSignup = searchParams.get('signup') === 'true'

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleCognitoAuth = (signup: boolean) => {
    const authUrl = getLoginUrl(signup)
    window.location.href = authUrl
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      {/* Back Link */}
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                ResumeAI
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignup ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400">
              {isSignup
                ? 'Sign up to start building professional resumes'
                : 'Sign in with your username, email, or phone number'}
            </p>
          </div>

          {/* Auth Card */}
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm">
            {isSignup ? (
              <>
                {/* Sign Up Section */}
                <div className="space-y-4">
                  <button
                    onClick={() => handleCognitoAuth(true)}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Create Account
                  </button>
                </div>

                {/* Sign Up Info */}
                <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white mb-3">What you&apos;ll need:</h3>
                  <ul className="space-y-2">
                    {[
                      { icon: User, text: 'Username (for login)' },
                      { icon: Mail, text: 'Email address' },
                      { icon: KeyRound, text: 'Password (8+ characters)' },
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm text-slate-400">
                        <item.icon className="w-4 h-4 text-violet-400" />
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Required Profile Fields Info */}
                <div className="mt-4 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <h3 className="text-sm font-semibold text-violet-300 mb-2">Required Information</h3>
                  <p className="text-sm text-violet-200/70 mb-2">
                    You&apos;ll also provide:
                  </p>
                  <ul className="text-sm text-violet-200/70 space-y-1 list-disc list-inside">
                    <li>First name (given name)</li>
                    <li>Last name (family name)</li>
                    <li>Nickname</li>
                    <li>Birthdate</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* Sign In Section */}
                <div className="space-y-4">
                  <button
                    onClick={() => handleCognitoAuth(false)}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Sign In
                  </button>
                </div>

                {/* Login Options Info */}
                <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white mb-3">Sign in with:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Username</p>
                        <p className="text-xs text-slate-400">Your unique username (case-insensitive)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                      <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-fuchsia-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Email</p>
                        <p className="text-xs text-slate-400">Your registered email address</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Phone Number</p>
                        <p className="text-xs text-slate-400">Your registered phone number</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900/50 text-slate-500">
                  Secured by AWS Cognito
                </span>
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-2">
              {[
                'Multi-factor authentication available',
                'Enterprise-grade security',
                'Your data is encrypted at rest',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Toggle Sign In / Sign Up */}
          <p className="text-center mt-6 text-slate-400">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <Link
                  href="/login?signup=true"
                  className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  Create one now
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
