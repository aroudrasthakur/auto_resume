'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, Loader2, CheckCircle, AlertCircle, Clock, Trash2, Target } from 'lucide-react';
import { apiFetch, downloadFile, getAuthHeaders } from '@/lib/api';
import { useInvalidateDashboardData } from '@/lib/use-dashboard-data';

const ESTIMATED_SECONDS = 60; // target sub-60s for AI generation
const CIRCUMFERENCE = 2 * Math.PI * 45;

const STEP_LABELS: Record<string, string> = {
  GENERATING_BULLETS: 'Generating bullets...',
  FINALIZING_RESUME: 'Finalizing resume...',
  RENDERING_TEMPLATE: 'Rendering template...',
  COMPILING_PDF: 'Compiling PDF...',
  UPLOADING: 'Uploading...',
  CHECKING_ATS: 'Checking ATS...',
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
  const invalidateDashboard = useInvalidateDashboardData();
  const [status, setStatus] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const previewBlobRef = useRef<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(ESTIMATED_SECONDS);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;
    setSecondsRemaining(ESTIMATED_SECONDS);

    const fetchStatus = async () => {
      try {
        const res = await apiFetch<{ status: string; current_step?: string; created_at?: string; failure_reason?: string; ats_score?: number; ats_feedback?: string }>(`/resumes/${resumeId}`);
        if (res.ok && res.data) {
          const data = res.data;
          setStatus(data);

          if (data.status === 'QUEUED' || data.status === 'RUNNING') {
            if (startTimeRef.current === null) {
              startTimeRef.current = Date.now();
            }
          }

          if (data.status === 'DONE') {
            setFilesLoading(true);
            const filesRes = await apiFetch<{ id: string; type: string; download_url: string }[]>(`/resumes/${resumeId}/files`);
            setFilesLoading(false);
            if (filesRes.ok && Array.isArray(filesRes.data)) {
              setFiles(filesRes.data);
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

  // Fetch PDF as blob for preview when URL requires auth (local storage)
  useEffect(() => {
    if (status?.status !== 'DONE' || files.length === 0) return;
    const pdfFile = files.find((f) => f.type === 'PDF');
    if (!pdfFile?.download_url) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const isOurApi = pdfFile.download_url.startsWith(apiBase);
    if (!isOurApi) return; // External URL (Supabase) works in iframe directly
    const loadPreview = async () => {
      try {
        const res = await fetch(pdfFile.download_url, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (previewBlobRef.current) URL.revokeObjectURL(previewBlobRef.current);
        previewBlobRef.current = url;
        setPreviewBlobUrl(url);
      } catch {
        /* ignore */
      }
    };
    loadPreview();
    return () => {
      if (previewBlobRef.current) {
        URL.revokeObjectURL(previewBlobRef.current);
        previewBlobRef.current = null;
      }
      setPreviewBlobUrl(null);
    };
  }, [status?.status, files]);

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

  const fetchFilesIfNeeded = async (): Promise<{ id: string; type: string; download_url: string }[]> => {
    if (files.length > 0) return files;
    setFilesLoading(true);
    const filesRes = await apiFetch<{ id: string; type: string; download_url: string }[]>(`/resumes/${resumeId}/files`);
    setFilesLoading(false);
    if (filesRes.ok && Array.isArray(filesRes.data)) {
      setFiles(filesRes.data);
      return filesRes.data;
    }
    return [];
  };

  const handleDownload = async (url?: string, filename?: string) => {
    if (status?.status !== 'DONE') return;
    let downloadUrl = url;
    let downloadFilename = filename ?? 'resume.pdf';
    if (!downloadUrl) {
      const currentFiles = await fetchFilesIfNeeded();
      if (currentFiles.length === 0) {
        alert('Resume files are not available. The upload may have failed.');
        return;
      }
      const pdfFile = currentFiles.find((f) => f.type === 'PDF');
      downloadUrl = pdfFile?.download_url;
      downloadFilename = 'resume.pdf';
    }
    if (!downloadUrl) return;
    setDownloading(true);
    try {
      await downloadFile(downloadUrl, downloadFilename);
    } catch (err) {
      window.open(downloadUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    setDeleting(true);
    const res = await apiFetch(`/resumes/${resumeId}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) {
      invalidateDashboard();
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
            <div className="flex flex-wrap items-center justify-between gap-3">
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
              {status.status === 'DONE' && (
                <button
                  type="button"
                  onClick={() => handleDownload()}
                  disabled={downloading || filesLoading}
                  className="inline-flex items-center gap-1.5 rounded border border-gold/40 px-2.5 py-1.5 font-mono text-xs text-gold hover:bg-gold/10 transition-colors disabled:opacity-50 shrink-0"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloading ? 'Downloading…' : filesLoading ? 'Loading…' : 'Download PDF'}
                </button>
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

            {status.status === 'DONE' && (status.ats_score != null || status.ats_feedback) && (
              <div className="mt-4 pt-4 border-t border-b1">
                <h2 className="font-body font-medium text-text mb-2">ATS Score</h2>
                <div className="flex flex-wrap items-center gap-3">
                  {status.ats_score != null && (
                    <div className="inline-flex items-center gap-2 rounded border border-gold/30 bg-gold/5 px-4 py-2">
                      <Target className="w-4 h-4 text-gold" />
                      <span className="font-heading text-xl text-gold" style={{ fontFamily: 'var(--font-heading)' }}>
                        {status.ats_score}/100
                      </span>
                    </div>
                  )}
                  {status.ats_feedback && (
                    <p className="font-body text-sm text-muted max-w-xl">{status.ats_feedback}</p>
                  )}
                </div>
              </div>
            )}

            {status.status === 'DONE' && files.length > 0 && (
              <div className="mt-4 pt-4 border-t border-b1 space-y-4">
                {(() => {
                  const pdfFile = files.find((f) => f.type === 'PDF');
                  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                  const needsBlobPreview = pdfFile?.download_url?.startsWith(apiBase);
                  const iframeSrc = needsBlobPreview ? previewBlobUrl : pdfFile?.download_url;
                  return (
                    <>
                      {pdfFile?.download_url && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <button
                            type="button"
                            onClick={() => handleDownload(pdfFile.download_url, 'resume.pdf')}
                            disabled={downloading}
                            className="inline-flex items-center gap-1.5 rounded border border-gold/40 px-2.5 py-1.5 font-mono text-xs text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            <Download className="w-3.5 h-3.5" />
                            {downloading ? 'Downloading…' : 'This looks perfect!'}
                          </button>
                        </div>
                      )}
                      {pdfFile?.download_url && (
                        <div>
                          <h2 className="font-body font-medium text-text mb-3">Preview</h2>
                          <div className="rounded border border-b1 bg-white overflow-hidden">
                            {iframeSrc ? (
                              <iframe
                                src={iframeSrc}
                                title="Resume preview"
                                className="w-full min-h-[600px] aspect-[8.5/11]"
                              />
                            ) : needsBlobPreview ? (
                              <div className="flex min-h-[600px] items-center justify-center bg-b2 text-muted font-body text-sm">
                                Loading preview…
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
                <div>
                  <h2 className="font-body font-medium text-text mb-3">All files</h2>
                  <ul className="space-y-2">
                    {files.map((file) => (
                      <li key={file.id}>
                        <button
                          type="button"
                          onClick={() => handleDownload(file.download_url, file.type === 'PDF' ? 'resume.pdf' : 'resume.tex')}
                          className="inline-flex items-center gap-2 font-body text-sm text-gold hover:text-gold/80 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          {file.type}
                        </button>
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
