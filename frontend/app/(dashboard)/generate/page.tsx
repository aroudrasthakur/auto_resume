'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GeneratePage() {
  const router = useRouter()
  const [jobDescription, setJobDescription] = useState('')
  const [pageCount, setPageCount] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/resumes/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            profile_id: 'default', // TODO: Get from user profile
            job_description_text: jobDescription,
            template_id: 'JakesResumeATS',
            page_count: pageCount,
            include_projects: true,
            include_skills: true,
            outputs: ['PDF'],
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        router.push(`/dashboard/resumes/${data.generated_resume_id}`)
      } else {
        alert('Failed to generate resume')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating resume')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Generate Resume
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
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
                <span className="ml-2">{count} Page{count > 1 ? 's' : ''}</span>
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

