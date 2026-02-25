'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Loader2, User, GraduationCap, Briefcase, Code2, Wrench } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useInvalidateDashboardData } from '@/lib/use-dashboard-data'

interface Profile {
  id: string
  name?: string
  headline?: string
}

const SECTION_LINKS: Record<string, { href: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  profile: { href: '/profile', label: 'Profile', icon: User },
  contacts: { href: '/profile', label: 'Contacts', icon: User },
  education: { href: '/education', label: 'Education', icon: GraduationCap },
  experience: { href: '/experience', label: 'Experience', icon: Briefcase },
  projects: { href: '/projects', label: 'Projects', icon: Code2 },
  skills: { href: '/skills', label: 'Skills', icon: Wrench },
}

export default function GeneratePage() {
  const router = useRouter()
  const invalidateDashboard = useInvalidateDashboardData()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [jobDescription, setJobDescription] = useState('')
  const [pageCount, setPageCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missingSections, setMissingSections] = useState<string[] | null>(null)

  useEffect(() => {
    apiFetch<Profile[]>('/profiles').then((res) => {
      if (res.ok && res.data && Array.isArray(res.data)) setProfiles(res.data)
      setLoadingProfiles(false)
    })
  }, [])

  const profileId = profiles[0]?.id ?? null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileId) {
      setError('Create a profile first. Go to Dashboard and complete your profile, or add an experience to auto-create one.')
      return
    }
    setLoading(true)
    setError(null)
    setMissingSections(null)
    const res = await apiFetch<{ generated_resume_id: string }>('/resumes/generate', {
      method: 'POST',
      body: JSON.stringify({
        profile_id: profileId,
        job_description_text: jobDescription.trim(),
        template_id: 'JakesResumeATS',
        page_count: pageCount,
        include_projects: true,
        include_skills: true,
        outputs: ['PDF'],
      }),
    })
    if (res.ok && res.data?.generated_resume_id) {
      invalidateDashboard()
      router.push(`/resumes/${res.data.generated_resume_id}`)
      return
    }
    if (res.errorData?.code === 'PROFILE_INCOMPLETE' && res.errorData?.missing_sections?.length) {
      setMissingSections(res.errorData.missing_sections)
      setError(null)
    } else {
      setError(res.error ?? 'Failed to generate resume')
      setMissingSections(null)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-7 px-5 py-8 md:gap-10 md:px-10 md:py-10">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </div>

      <h1
        className="font-heading text-2xl text-text"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Generate resume
      </h1>

      {error && (
        <div className="rounded border border-red-500/50 bg-red-500/10 px-4 py-3 font-body text-sm text-red-400">
          {error}
        </div>
      )}

      {missingSections && missingSections.length > 0 && (
        <div className="rounded border border-amber-500/40 bg-amber-500/5 px-5 py-5">
          <p className="font-body text-amber-200/90 mb-1">
            Almost there — complete these sections to generate your resume:
          </p>
          <p className="font-body text-sm text-muted mb-4">
            Add your information to the sections below so we can build a tailored resume for you.
          </p>
          <div className="flex flex-wrap gap-2">
            {missingSections.map((key) => {
              const section = SECTION_LINKS[key]
              if (!section) return null
              const Icon = section.icon
              return (
                <Link
                  key={key}
                  href={section.href}
                  className="inline-flex items-center gap-2 rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 font-body text-sm font-medium text-amber-200/90 transition-colors hover:border-amber-500/50 hover:bg-amber-500/15"
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </Link>
              )
            })}
          </div>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex font-body text-sm font-medium text-gold hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      )}

      {loadingProfiles ? (
        <p className="font-body text-muted">Loading profiles…</p>
      ) : !profileId ? (
        <div className="rounded border border-b1 bg-s1 p-6">
          <p className="font-body text-muted mb-2">
            You need a resume profile before generating. Add at least one experience from the Experience page to create a profile, or complete your profile from the Dashboard.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              href="/experience"
              className="inline-flex items-center gap-2 rounded px-3 py-2 font-body text-sm font-semibold text-[var(--bg)]"
              style={{ backgroundColor: 'var(--gold)', borderRadius: '3px' }}
            >
              Add experience
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 font-body text-sm font-medium text-gold hover:underline"
            >
              Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="job-description"
              className="mb-2 block font-mono text-xs uppercase text-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Job description
            </label>
            <textarea
              id="job-description"
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full rounded border border-b1 bg-s1 px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
              placeholder="Paste the job posting or description here so we can tailor your resume."
              required
            />
          </div>
          <div>
            <span className="mb-2 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
              Page count
            </span>
            <div className="flex gap-4">
              {[1, 2, 3].map((count) => (
                <label key={count} className="flex cursor-pointer items-center gap-2 font-body text-text">
                  <input
                    type="radio"
                    name="page-count"
                    value={count}
                    checked={pageCount === count}
                    onChange={() => setPageCount(count)}
                    className="border-b2 text-gold focus:ring-gold"
                  />
                  {count} page{count > 1 ? 's' : ''}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded px-4 py-3 font-body text-sm font-semibold text-[var(--bg)] disabled:opacity-50 transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--gold)', borderRadius: '3px' }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate resume
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
