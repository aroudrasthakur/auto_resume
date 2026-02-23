'use client'

import { useCallback, useEffect, useState } from 'react'
import { User, Briefcase, Sparkles } from 'lucide-react'
import StatHero from '@/components/StatHero'
import ProgressRing from '@/components/ProgressRing'
import ActionCard from '@/components/ActionCard'
import { useDisplayUser } from '@/lib/use-display-user'
import { apiFetch } from '@/lib/api'

interface ProfileCompleteness {
  is_complete: boolean
  missing_sections: string[]
  profile_id?: string
}

const NEXT_STEPS = [
  {
    counter: '01',
    title: 'Complete Your Profile',
    description: 'Add your personal information and contact details.',
    href: '/profile',
    icon: User,
  },
  {
    counter: '02',
    title: 'Add Experience',
    description: 'Add your work history and accomplishments.',
    href: '/experience',
    icon: Briefcase,
  },
  {
    counter: '03',
    title: 'Generate Resume',
    description: 'Create an AI-tailored resume for a job posting.',
    href: '/generate',
    icon: Sparkles,
  },
]

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false)
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null)
  const [experiencesCount, setExperiencesCount] = useState(0)
  const [resumesCount, setResumesCount] = useState(0)
  const [skillsCount, setSkillsCount] = useState(0)
  const { displayName } = useDisplayUser()

  useEffect(() => {
    setLoaded(true)
  }, [])

  const fetchData = useCallback(async () => {
    const [checkRes, expRes, resumesRes, skillsRes] = await Promise.all([
      apiFetch<ProfileCompleteness>('/profiles/check'),
      apiFetch<unknown[]>('/experience'),
      apiFetch<unknown[]>('/resumes'),
      apiFetch<unknown[]>('/skills/categories'),
    ])

    if (checkRes.ok && checkRes.data) {
      setCompleteness(checkRes.data)
    }
    if (expRes.ok && Array.isArray(expRes.data)) {
      setExperiencesCount(expRes.data.length)
    }
    if (resumesRes.ok && Array.isArray(resumesRes.data)) {
      setResumesCount(resumesRes.data.length)
    }
    if (skillsRes.ok && Array.isArray(skillsRes.data)) {
      setSkillsCount(skillsRes.data.length)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const onFocus = () => fetchData()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchData])

  const missing = completeness?.missing_sections ?? []
  const hasPersonalInfo = !missing.includes('profile') && !missing.includes('contacts')
  const hasExperience = !missing.includes('experience')
  const hasEducation = !missing.includes('education')
  const hasSkills = skillsCount > 0

  const progressSteps = [
    { label: 'Personal info', done: hasPersonalInfo },
    { label: 'Work experience', done: hasExperience },
    { label: 'Education', done: hasEducation },
    { label: 'Skills', done: hasSkills },
  ]

  const doneCount = progressSteps.filter((s) => s.done).length
  const completionPercent = progressSteps.length > 0 ? Math.round((doneCount / progressSteps.length) * 100) : 0

  return (
    <div
      className={`flex flex-col gap-7 px-5 py-8 md:gap-10 md:px-[40px] md:py-[40px] ${loaded ? 'is-loaded' : ''}`}
    >
      <div className="animate-fade-up delay-50">
        <h1 className="font-heading text-2xl text-text mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          Welcome back{displayName !== 'User' ? `, ${displayName.split(' ')[0]}` : ''}
        </h1>
        <p className="font-body text-sm text-muted">
          Here&apos;s your resume builder overview.
        </p>
      </div>
      <div className="animate-fade-up delay-50">
        <StatHero
          profileStatus={completeness?.is_complete ? 'Complete' : 'Incomplete'}
          experiencesCount={experiencesCount}
          resumesCount={resumesCount}
        />
      </div>

      <div className="animate-fade-up delay-100">
        <ProgressRing completion={completionPercent} steps={progressSteps} />
      </div>

      <section className="animate-fade-up delay-150">
        <div className="relative mb-4 flex items-center gap-4">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted shrink-0"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Next steps
          </p>
          <span
            className="h-px flex-1 bg-b1"
            style={{ backgroundColor: 'var(--b1)' }}
            aria-hidden
          />
        </div>
        <div
          className="grid grid-cols-1 gap-px overflow-hidden rounded border border-b1 bg-b1 md:grid-cols-3"
          style={{ borderRadius: '4px', borderColor: 'var(--b1)' }}
        >
          {NEXT_STEPS.map((step) => (
            <ActionCard
              key={step.title}
              counter={step.counter}
              icon={step.icon}
              title={step.title}
              description={step.description}
              href={step.href}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
