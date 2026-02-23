'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-md mx-auto text-center py-12">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-b2 bg-s1 text-red mb-6">
          <AlertCircle className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="font-heading text-xl text-text mb-2">Something went wrong</h1>
        <p className="text-muted text-sm mb-6">
          We couldn’t load this page. Try again or return to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-gold text-bg font-medium hover:bg-gold-lt transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-11 px-5 rounded-md border border-b2 bg-s1 text-text font-medium hover:bg-b2 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
