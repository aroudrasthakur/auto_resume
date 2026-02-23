'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Loader2, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { apiFetch } from '@/lib/api'

interface Resume {
  id: string
  profile_id: string
  profile_name?: string
  status: 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED'
  page_count: number
  created_at: string
  failure_reason?: string
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  const fetchResumes = async () => {
    const res = await apiFetch<Resume[]>('/resumes')
    if (res.ok && res.data) {
      setResumes(Array.isArray(res.data) ? res.data : [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  const inProgress = resumes.filter((r) => r.status === 'QUEUED' || r.status === 'RUNNING')
  const completed = resumes.filter((r) => r.status === 'DONE')
  const failed = resumes.filter((r) => r.status === 'FAILED')

  const statusBadge = (status: Resume['status']) => {
    switch (status) {
      case 'QUEUED':
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Queued
          </span>
        )
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating
          </span>
        )
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            Done
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-xs bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        )
      default:
        return <span className="font-mono text-xs text-muted">{status}</span>
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-7 px-5 py-8 md:px-10 md:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold" style={{ fontFamily: 'var(--font-mono)' }}>
          ← Dashboard
        </Link>
        <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Resumes</h1>
        <p className="font-body text-muted">Loading…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7 px-5 py-8 md:gap-10 md:px-10 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold" style={{ fontFamily: 'var(--font-mono)' }}>
          ← Dashboard
        </Link>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 rounded px-3 py-2 font-body text-sm font-semibold text-[var(--bg)] transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--gold)', borderRadius: '3px' }}
        >
          <FileText className="w-4 h-4" />
          Generate new
        </Link>
      </div>

      <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Resumes</h1>

      {inProgress.length > 0 && (
        <section>
          <h2 className="mb-3 font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>In progress</h2>
          <div className="space-y-3">
            {inProgress.map((r) => (
              <Link
                key={r.id}
                href={`/resumes/${r.id}`}
                className="flex items-center justify-between gap-4 rounded border border-b1 bg-s1 p-4 hover:bg-s2 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-body font-medium text-text truncate">
                    {r.profile_name || 'Resume'} · {r.page_count} page{r.page_count > 1 ? 's' : ''}
                  </p>
                  <p className="font-mono text-xs text-muted2 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                    {formatDate(r.created_at)}
                  </p>
                </div>
                {statusBadge(r.status)}
              </Link>
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="mb-3 font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Completed</h2>
          <div className="space-y-3">
            {completed.map((r) => (
              <Link
                key={r.id}
                href={`/resumes/${r.id}`}
                className="flex items-center justify-between gap-4 rounded border border-b1 bg-s1 p-4 hover:bg-s2 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-body font-medium text-text truncate">
                    {r.profile_name || 'Resume'} · {r.page_count} page{r.page_count > 1 ? 's' : ''}
                  </p>
                  <p className="font-mono text-xs text-muted2 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                    {formatDate(r.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(r.status)}
                  <Download className="w-4 h-4 text-muted" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {failed.length > 0 && (
        <section>
          <h2 className="mb-3 font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Failed</h2>
          <div className="space-y-3">
            {failed.map((r) => (
              <Link
                key={r.id}
                href={`/resumes/${r.id}`}
                className="flex items-center justify-between gap-4 rounded border border-red-500/20 bg-red-500/5 p-4 hover:bg-red-500/10 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-body font-medium text-text truncate">
                    {r.profile_name || 'Resume'} · {r.page_count} page{r.page_count > 1 ? 's' : ''}
                  </p>
                  <p className="font-mono text-xs text-muted2 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                    {formatDate(r.created_at)}
                  </p>
                  {r.failure_reason && (
                    <p className="font-body text-xs text-red-400 mt-1 truncate max-w-md">{r.failure_reason}</p>
                  )}
                </div>
                {statusBadge(r.status)}
              </Link>
            ))}
          </div>
        </section>
      )}

      {resumes.length === 0 && (
        <div className="rounded border border-b1 bg-s1 p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted mb-4" />
          <p className="font-body text-muted mb-4">No resumes yet.</p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 rounded px-4 py-2 font-body text-sm font-semibold text-[var(--bg)]"
            style={{ backgroundColor: 'var(--gold)', borderRadius: '3px' }}
          >
            <FileText className="w-4 h-4" />
            Generate your first resume
          </Link>
        </div>
      )}
    </div>
  )
}
