'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Code2, Plus, Trash2 } from 'lucide-react'
import { apiFetch } from '@/lib/api'

interface Profile {
  id: string
  name: string
}

interface ProjectBullet {
  id: string
  bullet: string
}

interface Project {
  id: string
  profile_id: string
  name: string
  role?: string
  start_date?: string
  end_date?: string
  project_bullet?: ProjectBullet[]
}

export default function ProjectsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    start_date: '',
    end_date: '',
    bullets: [''] as string[],
  })

  const fetchData = useCallback(async () => {
    const [profilesRes, projectsRes] = await Promise.all([
      apiFetch<Profile[]>('/profiles'),
      apiFetch<Project[]>('/projects'),
    ])
    if (profilesRes.ok && Array.isArray(profilesRes.data)) {
      setProfiles(profilesRes.data)
      if (profilesRes.data.length > 0 && !selectedProfileId) {
        setSelectedProfileId(profilesRes.data[0].id)
      }
    }
    if (projectsRes.ok && Array.isArray(projectsRes.data)) {
      setProjects(projectsRes.data)
    }
    setLoading(false)
  }, [selectedProfileId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) setSelectedProfileId(profiles[0].id)
  }, [profiles])

  const filteredProjects = projects.filter((p) => p.profile_id === selectedProfileId)

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
      const createRes = await apiFetch<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          profile_id: selectedProfileId,
          name: formData.name,
          role: formData.role || undefined,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
        }),
      })
      if (createRes.ok && createRes.data) {
        const bulletsToAdd = formData.bullets.filter((b) => b.trim())
        if (bulletsToAdd.length > 0) {
          await apiFetch(`/projects/${createRes.data.id}/bullets`, {
            method: 'POST',
            body: JSON.stringify({ bullets: bulletsToAdd }),
          })
        }
        setFormData({ name: '', role: '', start_date: '', end_date: '', bullets: [''] })
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
    if (!confirm('Delete this project?')) return
    const res = await apiFetch(`/projects/${id}`, { method: 'DELETE' })
    if (res.ok) fetchData()
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-7 px-5 py-8 md:px-10 md:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold" style={{ fontFamily: 'var(--font-mono)' }}>← Dashboard</Link>
        <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Projects</h1>
        <p className="font-body text-muted">Loading…</p>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col gap-7 px-5 py-8 md:px-10 md:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold" style={{ fontFamily: 'var(--font-mono)' }}>← Dashboard</Link>
        <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Projects</h1>
        <div className="rounded border border-b1 bg-s1 p-6">
          <p className="font-body text-muted mb-2">Create a profile first before adding projects.</p>
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
            Add project
          </button>
        )}
      </div>

      <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Projects</h1>

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
          <h2 className="font-heading text-lg text-text" style={{ fontFamily: 'var(--font-heading)' }}>New project</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Project name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
                className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                placeholder="Your role"
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
                  placeholder="Key accomplishment or responsibility"
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
        {filteredProjects.length === 0 ? (
          <div className="rounded border border-b1 bg-s1 p-6 text-center font-body text-muted">
            No projects yet. Add your first one above.
          </div>
        ) : (
          filteredProjects.map((proj) => (
            <div key={proj.id} className="flex justify-between items-start gap-4 rounded border border-b1 bg-s1 p-4 hover:bg-s2 transition-colors">
              <div className="min-w-0">
                <h3 className="font-body font-semibold text-text">{proj.name}</h3>
                {proj.role && <p className="font-body text-sm text-muted">{proj.role}</p>}
                {(proj.start_date || proj.end_date) && (
                  <p className="font-mono mt-1 text-xs text-muted2" style={{ fontFamily: 'var(--font-mono)' }}>
                    {proj.start_date} – {proj.end_date || '—'}
                  </p>
                )}
                {(proj.project_bullet?.length ?? 0) > 0 && (
                  <ul className="mt-2 list-disc list-inside font-body text-sm text-muted space-y-1">
                    {proj.project_bullet!.map((b) => (
                      <li key={b.id}>{b.bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button onClick={() => handleDelete(proj.id)} className="shrink-0 rounded p-2 text-muted hover:bg-s2 hover:text-red-400" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
