'use client'

import Link from 'next/link'
import { 
  User, 
  Briefcase, 
  FileText, 
  GraduationCap, 
  Code2, 
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { name: 'Profile', value: 'Incomplete', icon: User, href: '/profile', color: 'violet' },
    { name: 'Experiences', value: '0', icon: Briefcase, href: '/experience', color: 'fuchsia' },
    { name: 'Resumes Generated', value: '0', icon: FileText, href: '/generate', color: 'cyan' },
  ]

  const quickActions = [
    {
      title: 'Complete Your Profile',
      description: 'Add your personal information and contact details',
      icon: User,
      href: '/profile',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      title: 'Add Experience',
      description: 'Add your work history and accomplishments',
      icon: Briefcase,
      href: '/experience',
      gradient: 'from-fuchsia-500 to-pink-500',
    },
    {
      title: 'Generate Resume',
      description: 'Create an AI-tailored resume for a job posting',
      icon: Sparkles,
      href: '/generate',
      gradient: 'from-cyan-500 to-blue-500',
    },
  ]

  const profileSections = [
    { name: 'Education', icon: GraduationCap, count: 0, status: 'empty' },
    { name: 'Experience', icon: Briefcase, count: 0, status: 'empty' },
    { name: 'Projects', icon: Code2, count: 0, status: 'empty' },
    { name: 'Skills', icon: FileText, count: 0, status: 'empty' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back{user?.firstName ? `, ${user.firstName}` : (user?.nickname ? `, ${user.nickname}` : '')}!
        </h1>
        <p className="mt-2 text-slate-600">
          Here&apos;s an overview of your resume builder progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
            <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-all"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} mb-4`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                {action.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{action.description}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-violet-600">
                Get started
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Profile Completion */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile Sections</h2>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {profileSections.map((section) => (
              <div
                key={section.name}
                className="flex flex-col items-center p-4 rounded-xl bg-slate-50 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 mb-3">
                  <section.icon className="h-5 w-5 text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-900">{section.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {section.count === 0 ? 'Not added' : `${section.count} items`}
                </p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Profile Completion</span>
              <span className="text-sm font-medium text-violet-600">0%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: '0%' }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Complete your profile to generate better, more personalized resumes.
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Ready to build your resume?</h2>
            <p className="text-violet-100">
              Start by adding your experience and education, then let AI create the perfect resume for any job.
            </p>
          </div>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-violet-600 font-semibold hover:bg-violet-50 transition-colors flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
            Create Resume
          </Link>
        </div>
      </div>
    </div>
  )
}
