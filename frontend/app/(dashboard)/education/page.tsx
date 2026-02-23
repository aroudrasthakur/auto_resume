'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Plus, Trash2 } from 'lucide-react'

interface Profile {
  id: string
  name: string
}

interface EducationHighlight {
  id: string
  highlight: string
}

interface Education {
  id: string
  profile_id: string
  school: string
  degree?: string
  major?: string
  gpa?: string
  location?: string
  start_date?: string
  end_date?: string
  education_highlight?: EducationHighlight[]
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
    location: '',
    start_date: '',
    end_date: '',
    highlights: [''] as string[],
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

  const addHighlight = () => {
    setFormData((p) => ({ ...p, highlights: [...p.highlights, ''] }))
  }

  const updateHighlight = (i: number, v: string) => {
    setFormData((p) => ({
      ...p,
      highlights: p.highlights.map((h, j) => (j === i ? v : h)),
    }))
  }

  const removeHighlight = (i: number) => {
    setFormData((p) => ({ ...p, highlights: p.highlights.filter((_, j) => j !== i) }))
  }

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
          location: formData.location || undefined,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        const highlightsToAdd = formData.highlights.filter((h) => h.trim())
        if (highlightsToAdd.length > 0) {
          await fetch(`${apiUrl}/api/v1/education/${created.id}/highlights`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ highlights: highlightsToAdd }),
          })
        }
        setFormData({
          school: '',
          degree: '',
          major: '',
          gpa: '',
          location: '',
          start_date: '',
          end_date: '',
          highlights: [''],
        })
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
      <div className="flex flex-col gap-7 px-5 py-8 md:px-10 md:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold" style={{ fontFamily: 'var(--font-mono)' }}>← Dashboard</Link>
        <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Education</h1>
        <p className="font-body text-muted">Loading…</p>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col gap-7 px-5 py-8 md:px-10 md:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold" style={{ fontFamily: 'var(--font-mono)' }}>← Dashboard</Link>
        <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Education</h1>
        <div className="rounded border border-b1 bg-s1 p-6">
          <p className="font-body text-muted mb-2">Create a profile first before adding education.</p>
          <Link href="/profile" className="font-body text-sm font-medium text-gold hover:underline">Go to Profile</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7 px-5 py-8 md:gap-10 md:px-10 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold" style={{ fontFamily: 'var(--font-mono)' }}>← Dashboard</Link>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded px-3 py-2 font-body text-sm font-semibold text-[var(--bg)] transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--gold)', borderRadius: '3px' }}
          >
            <Plus className="w-4 h-4" />
            Add education
          </button>
        )}
      </div>

      <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Education</h1>

      {profiles.length > 1 && (
        <div>
          <label className="mb-2 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Profile</label>
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="rounded border border-b1 bg-s1 px-3 py-2 font-body text-text focus:border-gold focus:outline-none"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded border border-b1 bg-s1 p-6 space-y-4">
          <h2 className="font-heading text-lg text-text" style={{ fontFamily: 'var(--font-heading)' }}>New education</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>School *</label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData((p) => ({ ...p, school: e.target.value }))}
                required
                className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Degree</label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData((p) => ({ ...p, degree: e.target.value }))}
                placeholder="e.g. Bachelor of Science"
                className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Major</label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData((p) => ({ ...p, major: e.target.value }))}
                placeholder="e.g. Computer Science"
                className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>GPA</label>
              <input
                type="text"
                value={formData.gpa}
                onChange={(e) => setFormData((p) => ({ ...p, gpa: e.target.value }))}
                placeholder="e.g. 3.8"
                className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Start date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>End date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
                className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Highlights (at least one for resume)</label>
              <button type="button" onClick={addHighlight} className="font-body text-sm text-gold hover:underline">
                <Plus className="w-4 h-4 inline" /> Add
              </button>
            </div>
            {formData.highlights.map((h, i) => (
              <div key={i} className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={h}
                  onChange={(e) => updateHighlight(i, e.target.value)}
                  placeholder="Achievement or coursework"
                  className="flex-1 rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
                />
                <button type="button" onClick={() => removeHighlight(i)} disabled={formData.highlights.length === 1} className="rounded p-2 text-muted hover:bg-s2 hover:text-red-400 disabled:opacity-40">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !formData.highlights.some((h) => h.trim())}
              className="rounded px-3 py-2 font-body text-sm font-semibold text-[var(--bg)] disabled:opacity-50"
              style={{ backgroundColor: 'var(--gold)', borderRadius: '3px' }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded border border-b1 bg-s1 px-3 py-2 font-body text-sm text-muted hover:bg-s2 hover:text-text">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {filteredEducations.length === 0 ? (
          <div className="rounded border border-b1 bg-s1 p-6 text-center font-body text-muted">
            No education entries yet. Add your first one above.
          </div>
        ) : (
          filteredEducations.map((edu) => (
            <div key={edu.id} className="flex justify-between items-start gap-4 rounded border border-b1 bg-s1 p-4 hover:bg-s2 transition-colors">
              <div className="min-w-0">
                <h3 className="font-body font-semibold text-text">{edu.school}</h3>
                {(edu.degree || edu.major) && (
                  <p className="font-body text-sm text-muted">
                    {[edu.degree, edu.major].filter(Boolean).join(' in ')}
                  </p>
                )}
                {(edu.start_date || edu.end_date) && (
                  <p className="font-mono mt-1 text-xs text-muted2" style={{ fontFamily: 'var(--font-mono)' }}>
                    {edu.start_date} – {edu.end_date || '—'}
                  </p>
                )}
                {edu.gpa && (
                  <p className="font-body text-sm text-muted">GPA: {edu.gpa}</p>
                )}
                {(edu.education_highlight?.length ?? 0) > 0 && (
                  <ul className="mt-2 list-disc list-inside font-body text-sm text-muted space-y-1">
                    {edu.education_highlight!.map((h) => (
                      <li key={h.id}>{h.highlight}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button onClick={() => handleDelete(edu.id)} className="shrink-0 rounded p-2 text-muted hover:bg-s2 hover:text-red-400" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
