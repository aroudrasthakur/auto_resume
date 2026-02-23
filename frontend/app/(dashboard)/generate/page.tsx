'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  name: string
  headline?: string
}

interface CompletenessCheck {
  is_complete: boolean
  missing_sections: string[]
  profile_id: string | null
}

export default function GeneratePage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [completeness, setCompleteness] = useState<CompletenessCheck | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [jobDescription, setJobDescription] = useState('')
  const [pageCount, setPageCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  })

  useEffect(() => {
    const fetchProfilesAndCheck = async () => {
      setProfileLoading(true)
      setError(null)
      try {
        const [profilesRes, checkRes] = await Promise.all([
          fetch(`${apiUrl}/api/v1/profiles`, { headers: getAuthHeaders() }),
          fetch(`${apiUrl}/api/v1/profiles/check`, { headers: getAuthHeaders() }),
        ])

        let profilesData: Profile[] = []
        if (profilesRes.ok) {
          profilesData = await profilesRes.json()
          setProfiles(profilesData)
        }

        if (checkRes.ok) {
          const checkData = await checkRes.json()
          setCompleteness(checkData)
          if (checkData.profile_id) {
            setSelectedProfileId(checkData.profile_id)
          } else if (profilesData.length > 0) {
            setSelectedProfileId(profilesData[0].id)
          }
        } else if (profilesData.length > 0) {
          setSelectedProfileId(profilesData[0].id)
        }
      } catch (err) {
        console.error('Error fetching profiles:', err)
        setError('Failed to load profile data')
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfilesAndCheck()
  }, [])

  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id)
    }
  }, [profiles, selectedProfileId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/api/v1/resumes/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          profile_id: selectedProfileId,
          job_description_text: jobDescription,
          template_id: 'JakesResumeATS',
          page_count: pageCount,
          include_projects: true,
          include_skills: true,
          outputs: ['PDF'],
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/resumes/${data.generated_resume_id}`)
      } else {
        if (data.code === 'PROFILE_INCOMPLETE' || response.status === 400) {
          setError(
            data.detail ||
              'Profile not set up. Please add your information, experience, and education before generating a resume.'
          )
          setCompleteness({
            is_complete: false,
            missing_sections: data.missing_sections || ['profile', 'experience', 'education', 'contacts'],
            profile_id: selectedProfileId,
          })
        } else {
          setError(data.detail || 'Failed to generate resume')
        }
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error generating resume')
    } finally {
      setLoading(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Generate Resume</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const isComplete = completeness?.is_complete ?? false
  const hasProfile = profiles.length > 0 && completeness?.profile_id
  const missingSections = completeness?.missing_sections ?? []

  if (!hasProfile || !isComplete) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Generate Resume</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-amber-800 mb-2">
            Set up your profile first
          </h2>
          <p className="text-amber-700 mb-4">
            {!hasProfile
              ? 'Create a profile and add your experience and education before generating a resume.'
              : 'Complete the following sections before generating a resume:'}
          </p>
          {missingSections.length > 0 && (
            <ul className="list-disc list-inside text-amber-700 mb-4 space-y-1">
              {missingSections.map((section) => (
                <li key={section} className="capitalize">
                  {section === 'profile' && 'Create a profile with your name'}
                  {section === 'contacts' && 'Add at least one contact (email, phone)'}
                  {section === 'experience' && 'Add at least one work experience with bullets'}
                  {section === 'education' && 'Add at least one education entry'}
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-3">
            <Link
              href="/profile"
              className="inline-flex items-center px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700"
            >
              Set up profile
            </Link>
            <Link
              href="/experience"
              className="inline-flex items-center px-4 py-2 rounded-md border border-amber-600 text-amber-700 hover:bg-amber-50"
            >
              Add experience
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Generate Resume</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {profiles.length > 1 && (
          <div>
            <label
              htmlFor="profile"
              className="block text-sm font-medium text-gray-700"
            >
              Profile
            </label>
            <select
              id="profile"
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="job-description"
            className="block text-sm font-medium text-gray-700"
          >
            Job Description
          </label>
          <textarea
            id="job-description"
            rows={10}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
            placeholder="Paste the job description from the company you're applying to..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Page Count
          </label>
          <div className="mt-2 space-x-4">
            {[1, 2, 3].map((count) => (
              <label key={count} className="inline-flex items-center">
                <input
                  type="radio"
                  name="page-count"
                  value={count}
                  checked={pageCount === count}
                  onChange={() => setPageCount(count)}
                  className="form-radio"
                />
                <span className="ml-2">
                  {count} Page{count > 1 ? 's' : ''}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Resume'}
        </button>
      </form>
    </div>
  )
}
