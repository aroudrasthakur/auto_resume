'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Loader2, FileText, AlertCircle } from 'lucide-react'
import { apiFetch } from '@/lib/api'

type ResumeStatus = {
  status: string
  failure_reason?: string
}

type ResumeFile = {
  id: string
  type: string
  download_url: string
}

export default function ResumeStatusPage() {
  const params = useParams()
  const resumeId = params.id as string
  const [status, setStatus] = useState<ResumeStatus | null>(null)
  const [files, setFiles] = useState<ResumeFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchStatus = async () => {
      const res = await apiFetch<ResumeStatus>(`/resumes/${resumeId}`)
      if (cancelled) return
      if (!res.ok) {
        setError(res.error ?? 'Failed to load resume')
        setLoading(false)
        return
      }
      if (res.data) {
        setStatus(res.data)
        if (res.data.status === 'DONE') {
          const filesRes = await apiFetch<ResumeFile[]>(`/resumes/${resumeId}/files`)
          if (!cancelled && filesRes.ok && filesRes.data && Array.isArray(filesRes.data)) {
            setFiles(filesRes.data)
          }
        } else if (res.data.status !== 'FAILED') {
          setTimeout(fetchStatus, 2000)
          return
        }
      }
      setLoading(false)
    }

    fetchStatus()
    return () => { cancelled = true }
  }, [resumeId])

  return (
    <div className="flex flex-col gap-7 px-5 py-8 md:gap-10 md:px-10 md:py-10">
      <div className="flex items-center gap-4">
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Generate
        </Link>
        <Link
          href="/dashboard"
          className="font-mono text-sm text-muted hover:text-gold transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Dashboard
        </Link>
      </div>

      <h1
        className="font-heading text-2xl text-text"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Resume status
      </h1>

      {error && (
        <div className="flex items-center gap-2 rounded border border-red-500/50 bg-red-500/10 px-4 py-3 font-body text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="rounded border border-b1 bg-s1 overflow-hidden" style={{ borderRadius: '4px' }}>
        {loading ? (
          <div className="flex items-center gap-2 p-6 font-body text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking status…
          </div>
        ) : status ? (
          <div className="p-6">
            <p className="font-body text-text">
              Status:{' '}
              <span
                className={`font-semibold ${
                  status.status === 'DONE'
                    ? 'text-green'
                    : status.status === 'FAILED'
                    ? 'text-red-400'
                    : 'text-gold'
                }`}
              >
                {status.status}
              </span>
            </p>
            {status.status === 'DONE' && files.length > 0 && (
              <div className="mt-6">
                <h2 className="font-heading text-lg text-text mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  Download
                </h2>
                <ul className="space-y-2">
                  {files.map((file) => (
                    <li key={file.id}>
                      <a
                        href={file.download_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded border border-b2 bg-s2 px-3 py-2 font-body text-sm text-gold hover:border-gold hover:bg-s2 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download {file.type}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {status.status === 'FAILED' && status.failure_reason && (
              <p className="mt-2 font-body text-sm text-red-400">{status.failure_reason}</p>
            )}
            {(status.status === 'QUEUED' || status.status === 'RUNNING') && (
              <p className="mt-2 font-body text-sm text-muted">
                Your resume is being generated. This page will update automatically.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <FileText className="h-12 w-12 text-muted" stroke="var(--muted)" />
            <p className="font-body text-muted">No resume found.</p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 font-body text-sm font-medium text-gold hover:underline"
            >
              Generate a new resume
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
