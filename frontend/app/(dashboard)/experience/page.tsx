'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, Plus, Trash2 } from 'lucide-react'
import { useInvalidateDashboardData } from '@/lib/use-dashboard-data'
import { useDisplayUser } from '@/lib/use-display-user'
import { apiFetch } from '@/lib/api'

interface Profile {
  id: string
  name: string
}

interface ExperienceBullet {
  id: string
  bullet: string
}

interface Experience {
  id: string
  profile_id: string
  company: string
  role: string
  location?: string
  start_date?: string
  end_date?: string
  is_current?: boolean
  experience_bullet?: ExperienceBullet[]
}

export default function ExperiencePage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    bullets: [''] as string[],
  })

  const invalidateDashboard = useInvalidateDashboardData()
  const { displayName } = useDisplayUser()

  const fetchData = useCallback(async () => {
    try {
      const [profilesRes, expRes] = await Promise.all([
        apiFetch<Profile[]>('/profiles'),
        apiFetch<Experience[]>('/experience'),
      ])
      let profileList: Profile[] = profilesRes.ok && Array.isArray(profilesRes.data) ? profilesRes.data : []
      if (profileList.length === 0) {
        const createRes = await apiFetch<Profile>('/profiles', {
          method: 'POST',
          body: JSON.stringify({ name: displayName || 'Resume', contacts: [] }),
        })
        if (createRes.ok && createRes.data) {
          profileList = [createRes.data]
        }
      }
      setProfiles(profileList)
      if (profileList.length > 0 && !selectedProfileId) setSelectedProfileId(profileList[0].id)
      if (expRes.ok && Array.isArray(expRes.data)) setExperiences(expRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [displayName])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) setSelectedProfileId(profiles[0].id)
  }, [profiles])

  const filteredExperiences = experiences.filter((e) => e.profile_id === selectedProfileId)

  const addBullet = () => {
    setFormData((p) => ({ ...p, bullets: [...p.bullets, ''] }))
  }

  const updateBullet = (i: number, v: string) => {
    setFormData((p) => ({
      ...p,
      bullets: p.bullets.map((b, j) => (j === i ? v : b)),
    }))
  }

  const removeBullet = (i: number) => {
    setFormData((p) => ({ ...p, bullets: p.bullets.filter((_, j) => j !== i) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfileId) return
    setSaving(true)
    try {
      const res = await apiFetch<Experience>('/experience', {
        method: 'POST',
        body: JSON.stringify({
          profile_id: selectedProfileId,
          company: formData.company,
          role: formData.role,
          location: formData.location || undefined,
          start_date: formData.start_date || undefined,
          end_date: formData.is_current ? undefined : formData.end_date || undefined,
          is_current: formData.is_current,
        }),
      })
      if (res.ok && res.data) {
        const created = res.data
        const bulletsToAdd = formData.bullets.filter((b) => b.trim())
        if (bulletsToAdd.length > 0) {
          await apiFetch(`/experience/${created.id}/bullets`, {
            method: 'POST',
            body: JSON.stringify({ bullets: bulletsToAdd }),
          })
        }
        setFormData({
          company: '',
          role: '',
          location: '',
          start_date: '',
          end_date: '',
          is_current: false,
          bullets: [''],
        })
        setShowForm(false)
        fetchData()
        invalidateDashboard()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this experience?')) return
    try {
      await apiFetch(`/experience/${id}`, { method: 'DELETE' })
      fetchData()
      invalidateDashboard()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-7 px-5 py-8 md:px-10 md:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold" style={{ fontFamily: 'var(--font-mono)' }}>← Dashboard</Link>
        <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Experience</h1>
        <p className="font-body text-muted">Loading…</p>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col gap-7 px-5 py-8 md:px-10 md:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold" style={{ fontFamily: 'var(--font-mono)' }}>← Dashboard</Link>
        <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Experience</h1>
        <div className="rounded border border-b1 bg-s1 p-6">
          <p className="font-body text-muted mb-2">Unable to set up your resume profile. Please try again or create one from the Profile page.</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setLoading(true); fetchData(); }} className="font-body text-sm font-medium text-gold hover:underline">Retry</button>
            <Link href="/profile" className="font-body text-sm font-medium text-gold hover:underline">Go to Profile</Link>
          </div>
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
            Add experience
          </button>
        )}
      </div>

      <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Experience</h1>

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
          <h2 className="font-heading text-lg text-text" style={{ fontFamily: 'var(--font-heading)' }}>New experience</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Company *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                required
                className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Role *</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                required
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_current"
                checked={formData.is_current}
                onChange={(e) => setFormData((p) => ({ ...p, is_current: e.target.checked }))}
                className="rounded border-b2 text-gold focus:ring-gold"
              />
              <label htmlFor="is_current" className="font-body text-sm text-text">Current role</label>
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
                disabled={formData.is_current}
                className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text focus:border-gold focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Bullets (at least one for resume)</label>
              <button type="button" onClick={addBullet} className="font-body text-sm text-gold hover:underline">
                <Plus className="w-4 h-4 inline" /> Add
              </button>
            </div>
            {formData.bullets.map((b, i) => (
              <div key={i} className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={b}
                  onChange={(e) => updateBullet(i, e.target.value)}
                  placeholder="Accomplishment or responsibility"
                  className="flex-1 rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
                />
                <button type="button" onClick={() => removeBullet(i)} disabled={formData.bullets.length === 1} className="rounded p-2 text-muted hover:bg-s2 hover:text-red-400 disabled:opacity-40">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !formData.bullets.some((b) => b.trim())}
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
        {filteredExperiences.length === 0 ? (
          <div className="rounded border border-b1 bg-s1 p-6 text-center font-body text-muted">
            No experience entries yet. Add your first one above.
          </div>
        ) : (
          filteredExperiences.map((exp) => (
            <div key={exp.id} className="flex justify-between items-start gap-4 rounded border border-b1 bg-s1 p-4 hover:bg-s2 transition-colors">
              <div className="min-w-0">
                <h3 className="font-body font-semibold text-text">{exp.company}</h3>
                <p className="font-body text-sm text-muted">{exp.role}</p>
                {(exp.start_date || exp.end_date) && (
                  <p className="font-mono mt-1 text-xs text-muted2" style={{ fontFamily: 'var(--font-mono)' }}>
                    {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date || '—'}
                  </p>
                )}
                {(exp.experience_bullet?.length ?? 0) > 0 && (
                  <ul className="mt-2 list-disc list-inside font-body text-sm text-muted space-y-1">
                    {exp.experience_bullet!.map((b) => (
                      <li key={b.id}>{b.bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button onClick={() => handleDelete(exp.id)} className="shrink-0 rounded p-2 text-muted hover:bg-s2 hover:text-red-400" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
