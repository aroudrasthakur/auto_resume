'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Plus, Trash2 } from 'lucide-react'

interface Profile {
  id: string
  name: string
}

interface Education {
  id: string
  profile_id: string
  school: string
  degree?: string
  major?: string
  gpa?: string
  start_date?: string
  end_date?: string
  location?: string
}

export default function EducationPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [educations, setEducations] = useState<Education[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    school: '',
    degree: '',
    major: '',
    gpa: '',
    start_date: '',
    end_date: '',
    location: '',
  })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  })

  const fetchData = async () => {
    try {
      const [profilesRes, eduRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/profiles`, { headers: getAuthHeaders() }),
        fetch(`${apiUrl}/api/v1/education`, { headers: getAuthHeaders() }),
      ])
      if (profilesRes.ok) {
        const p = await profilesRes.json()
        setProfiles(p)
        if (p.length > 0 && !selectedProfileId) setSelectedProfileId(p[0].id)
      }
      if (eduRes.ok) {
        const e = await eduRes.json()
        setEducations(e)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) setSelectedProfileId(profiles[0].id)
  }, [profiles])

  const filteredEducations = educations.filter((e) => e.profile_id === selectedProfileId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfileId) return
    setSaving(true)
    try {
      const res = await fetch(`${apiUrl}/api/v1/education`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          profile_id: selectedProfileId,
          school: formData.school,
          degree: formData.degree || undefined,
          major: formData.major || undefined,
          gpa: formData.gpa || undefined,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          location: formData.location || undefined,
        }),
      })
      if (res.ok) {
        setFormData({ school: '', degree: '', major: '', gpa: '', start_date: '', end_date: '', location: '' })
        setShowForm(false)
        fetchData()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this education entry?')) return
    try {
      await fetch(`${apiUrl}/api/v1/education/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Education</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Education</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <p className="text-amber-800 mb-4">Create a profile first before adding education.</p>
          <Link href="/profile" className="text-violet-600 hover:underline font-medium">
            Go to Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Education</h1>

      {profiles.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile</label>
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm sm:text-sm"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700"
        >
          <Plus className="w-4 h-4" />
          Add education
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mb-8 bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">New education</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">School *</label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData((p) => ({ ...p, school: e.target.value }))}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Degree</label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData((p) => ({ ...p, degree: e.target.value }))}
                placeholder="e.g. B.S."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Major</label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData((p) => ({ ...p, major: e.target.value }))}
                placeholder="e.g. Computer Science"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GPA</label>
              <input
                type="text"
                value={formData.gpa}
                onChange={(e) => setFormData((p) => ({ ...p, gpa: e.target.value }))}
                placeholder="e.g. 3.8"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {filteredEducations.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            No education entries yet. Add your first one above.
          </div>
        ) : (
          filteredEducations.map((edu) => (
            <div key={edu.id} className="bg-white shadow rounded-lg p-6 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                {(edu.degree || edu.major) && (
                  <p className="text-gray-600">
                    {[edu.degree, edu.major].filter(Boolean).join(', ')}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </p>
                )}
                {(edu.start_date || edu.end_date) && (
                  <p className="text-sm text-gray-500">
                    {edu.start_date} – {edu.end_date || 'Present'}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(edu.id)}
                className="text-red-600 hover:text-red-700 p-1"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
