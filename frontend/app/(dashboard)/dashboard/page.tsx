'use client'

import { useEffect, useState } from 'react'
import { User, Briefcase, Sparkles } from 'lucide-react'
import StatHero from '@/components/StatHero'
import ProgressRing from '@/components/ProgressRing'
import ActionCard from '@/components/ActionCard'

const PROGRESS_STEPS = [
  { label: 'Personal info', done: false },
  { label: 'Education', done: false },
  { label: 'Work experience', done: false },
  { label: 'Skills', done: false },
]

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

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <div
      className={`flex flex-col gap-7 px-5 py-8 md:gap-10 md:px-[40px] md:py-[40px] ${loaded ? 'is-loaded' : ''}`}
    >
      <div className="animate-fade-up delay-50">
        <StatHero
          profileStatus="Incomplete"
          experiencesCount={0}
          resumesCount={0}
        />
      </div>

      <div className="animate-fade-up delay-100">
        <ProgressRing completion={0} steps={PROGRESS_STEPS} />
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
