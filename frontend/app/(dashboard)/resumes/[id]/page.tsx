'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, Loader2, CheckCircle, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const ESTIMATED_SECONDS = 120; // ~2 min for AI generation
const CIRCUMFERENCE = 2 * Math.PI * 45;

const STEP_LABELS: Record<string, string> = {
  GENERATING_BULLETS: 'Generating bullets...',
  FINALIZING_RESUME: 'Finalizing resume...',
  RENDERING_TEMPLATE: 'Rendering template...',
  COMPILING_PDF: 'Compiling PDF...',
  UPLOADING: 'Uploading...',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

export default function ResumeStatusPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id as string;
  const [status, setStatus] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(ESTIMATED_SECONDS);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;
    setSecondsRemaining(ESTIMATED_SECONDS);

    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/resumes/${resumeId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setStatus(data);

          if (data.status === 'QUEUED' || data.status === 'RUNNING') {
            if (startTimeRef.current === null) {
              startTimeRef.current = Date.now();
            }
          }

          if (data.status === 'DONE') {
            const filesResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/resumes/${resumeId}/files`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );
            if (filesResponse.ok) {
              const filesData = await filesResponse.json();
              setFiles(filesData);
            }
          } else if (data.status !== 'DONE' && data.status !== 'FAILED') {
            setTimeout(fetchStatus, 1500);
          }
        }
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    };

    fetchStatus();
  }, [resumeId]);

  useEffect(() => {
    if (status?.status !== 'QUEUED' && status?.status !== 'RUNNING') return;

    const tick = () => {
      if (startTimeRef.current === null) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, ESTIMATED_SECONDS - elapsed);
      setSecondsRemaining(remaining);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status?.status]);

  const handleDelete = async () => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    setDeleting(true);
    const res = await apiFetch(`/resumes/${resumeId}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) {
      router.push('/resumes');
    } else {
      alert(res.error ?? 'Failed to delete resume');
    }
  };

  const statusBadge = () => {
    if (!status) return null;
    switch (status.status) {
      case 'QUEUED':
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-sm bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-4 h-4" />
            Queued
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating
          </span>
        );
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-4 h-4" />
            Done
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-sm bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertCircle className="w-4 h-4" />
            Failed
          </span>
        );
      default:
        return <span className="font-mono text-sm text-muted">{status.status}</span>;
    }
  };

  return (
      <div className="flex flex-col gap-7 px-5 py-8 md:px-10 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/resumes"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Resumes
        </Link>
        {status && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded border border-red-500/30 px-3 py-2 font-body text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting…' : 'Delete resume'}
          </button>
        )}
      </div>

      <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>
        Resume Status
      </h1>

      <div className="rounded border border-b1 bg-s1 p-6">
        {status ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {statusBadge()}
              {status.created_at && (
                <span
                  className="font-mono text-xs text-muted2"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {new Date(status.created_at).toLocaleString()}
                </span>
              )}
            </div>

            {(status.status === 'QUEUED' || status.status === 'RUNNING') && (
              <div className="flex items-center gap-6 py-4">
                <div className="relative flex h-[100px] w-[100px] shrink-0">
                  <svg viewBox="0 0 100 100" className="h-[100px] w-[100px] -rotate-90" aria-hidden>
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="var(--b2)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={CIRCUMFERENCE - (secondsRemaining / ESTIMATED_SECONDS) * CIRCUMFERENCE}
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="font-heading text-xl text-gold"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {secondsRemaining > 0 ? formatTime(secondsRemaining) : '~'}
                    </span>
                    <span
                      className="font-mono text-[9px] uppercase tracking-wider text-muted"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {secondsRemaining > 0 ? 'remaining' : 'finishing'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-body text-sm text-muted">
                    {status.current_step && STEP_LABELS[status.current_step]
                      ? STEP_LABELS[status.current_step]
                      : status.status === 'QUEUED'
                        ? 'Your resume is in the queue. Generation typically takes about 2 minutes.'
                        : 'AI is tailoring your resume to the job description.'}
                  </p>
                </div>
              </div>
            )}

            {status.status === 'DONE' && files.length > 0 && (
              <div className="mt-4 pt-4 border-t border-b1 space-y-4">
                {(() => {
                  const pdfFile = files.find((f) => f.type === 'PDF');
                  return (
                    pdfFile?.download_url && (
                      <div>
                        <h2 className="font-body font-medium text-text mb-3">Preview</h2>
                        <div className="rounded border border-b1 bg-white overflow-hidden">
                          <iframe
                            src={pdfFile.download_url}
                            title="Resume preview"
                            className="w-full min-h-[600px] aspect-[8.5/11]"
                          />
                        </div>
                      </div>
                    )
                  );
                })()}
                <div>
                  <h2 className="font-body font-medium text-text mb-3">Download</h2>
                  <ul className="space-y-2">
                    {files.map((file) => (
                      <li key={file.id}>
                        <a
                          href={file.download_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-body text-sm text-gold hover:text-gold/80 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          {file.type}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {status.status === 'FAILED' && status.failure_reason && (
              <p className="font-body text-sm text-red-400 mt-2">{status.failure_reason}</p>
            )}
          </div>
        ) : (
          <p className="font-body text-muted">Loading…</p>
        )}
      </div>
    </div>
  );
}
