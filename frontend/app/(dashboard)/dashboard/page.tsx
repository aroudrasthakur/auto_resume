'use client'

import { useEffect, useState } from 'react'
import { User, Briefcase, GraduationCap, Code2, Wrench } from 'lucide-react'
import StatHero from '@/components/StatHero'
import ProgressRing from '@/components/ProgressRing'
import ActionCard from '@/components/ActionCard'
import { useDisplayUser } from '@/lib/use-display-user'
import { useDashboardData } from '@/lib/use-dashboard-data'

const STEP_CONFIG = [
  { key: 'profile', title: 'Complete Your Profile', description: 'Add your personal information and contact details.', href: '/profile', icon: User },
  { key: 'education', title: 'Add Education', description: 'Add your degrees and academic background.', href: '/education', icon: GraduationCap },
  { key: 'experience', title: 'Add Experience', description: 'Add your work history and accomplishments.', href: '/experience', icon: Briefcase },
  { key: 'projects', title: 'Add Projects', description: 'Showcase your projects and technical work.', href: '/projects', icon: Code2 },
  { key: 'skills', title: 'Add Skills', description: 'List your skills and expertise.', href: '/skills', icon: Wrench },
]

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false)
  const {
    completeness,
    experiencesCount,
    resumesCount,
    isLoading: dataLoading,
  } = useDashboardData()
  const { displayName } = useDisplayUser()

  useEffect(() => {
    setLoaded(true)
  }, [])

  const allMissing = ['profile', 'contacts', 'education', 'experience', 'projects', 'skills']
  const missing = dataLoading || !completeness ? allMissing : completeness.missing_sections
  const hasPersonalInfo = !missing.includes('profile') && !missing.includes('contacts')
  const hasEducation = !missing.includes('education')
  const hasExperience = !missing.includes('experience')
  const hasProjects = !missing.includes('projects')
  const hasSkills = !missing.includes('skills')

  const progressSteps = [
    { label: 'Profile', done: hasPersonalInfo },
    { label: 'Education', done: hasEducation },
    { label: 'Experience', done: hasExperience },
    { label: 'Projects', done: hasProjects },
    { label: 'Skills', done: hasSkills },
  ]

  const doneCount = progressSteps.filter((s) => s.done).length
  const completionPercent = dataLoading
    ? null
    : progressSteps.length > 0
      ? Math.round((doneCount / progressSteps.length) * 100)
      : 0

  return (
    <div
      className={`flex flex-col gap-7 px-5 py-8 md:gap-10 md:px-[40px] md:py-[40px] ${loaded ? 'is-loaded' : ''}`}
    >
      <div className="animate-fade-up delay-50">
        <h1 className="font-heading text-2xl text-text mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          Welcome back{displayName ? `, ${displayName.split(' ')[0]}` : ''}
        </h1>
        <p className="font-body text-sm text-muted">
          Here&apos;s your resume builder overview.
        </p>
      </div>
      <div className="animate-fade-up delay-50">
        <StatHero
          profileStatus={dataLoading ? 'Loading...' : (completeness?.is_complete ? 'Complete' : 'Incomplete')}
          experiencesCount={experiencesCount}
          resumesCount={resumesCount}
        />
      </div>

      <div className="animate-fade-up delay-100">
        <ProgressRing completion={completionPercent} steps={progressSteps} isLoading={dataLoading} />
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
          className="grid grid-cols-1 gap-px overflow-hidden rounded border border-b1 bg-b1 md:grid-cols-2 lg:grid-cols-3"
          style={{ borderRadius: '4px', borderColor: 'var(--b1)' }}
        >
          {STEP_CONFIG.map((step, idx) => {
            const isDone = dataLoading ? false : !missing.includes(step.key)
            return (
              <ActionCard
                key={step.key}
                counter={String(idx + 1).padStart(2, '0')}
                icon={step.icon}
                title={step.title}
                description={step.description}
                href={step.href}
                done={isDone}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}
