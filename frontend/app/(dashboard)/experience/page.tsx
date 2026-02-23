'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2, Briefcase } from 'lucide-react'
import { apiFetch } from '@/lib/api'

type Experience = {
  id: string
  company: string
  role: string
  location?: string
  start_date?: string
  end_date?: string
  is_current?: boolean
}

export default function ExperiencePage() {
  const [list, setList] = useState<Experience[]>([])
  const [profiles, setProfiles] = useState<{ id: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    company: '',
    role: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
  })

  const defaultProfileId = profiles[0]?.id ?? null

  const load = async () => {
    setLoading(true)
    setError(null)
    const [expRes, profRes] = await Promise.all([
      apiFetch<Experience[]>('/experience'),
      apiFetch<{ id: string }[]>('/profiles'),
    ])
    if (expRes.ok && expRes.data) setList(Array.isArray(expRes.data) ? expRes.data : [])
    if (profRes.ok && profRes.data) setProfiles(Array.isArray(profRes.data) ? profRes.data : [])
    if (!expRes.ok && expRes.error) setError(expRes.error)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm({ company: '', role: '', location: '', start_date: '', end_date: '', is_current: false })
    setFormOpen(true)
  }

  const openEdit = (e: Experience) => {
    setEditingId(e.id)
    setForm({
      company: e.company || '',
      role: e.role || '',
      location: e.location || '',
      start_date: e.start_date ? e.start_date.slice(0, 10) : '',
      end_date: e.end_date ? e.end_date.slice(0, 10) : '',
      is_current: !!e.is_current,
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
  }

  const save = async () => {
    if (!form.company.trim() || !form.role.trim()) return
    setSaving(true)
    setError(null)
    const body = {
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      is_current: form.is_current,
    }
    if (editingId) {
      const res = await apiFetch<Experience>(`/experience/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      if (res.ok) {
        closeForm()
        load()
      } else setError(res.error ?? 'Update failed')
    } else {
      if (!defaultProfileId) {
        setError('Create a profile first (Dashboard or Profile).')
        setSaving(false)
        return
      }
      const res = await apiFetch<Experience>('/experience', {
        method: 'POST',
        body: JSON.stringify({ ...body, profile_id: defaultProfileId }),
      })
      if (res.ok) {
        closeForm()
        load()
      } else setError(res.error ?? 'Create failed')
    }
    setSaving(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this experience?')) return
    setError(null)
    const res = await apiFetch(`/experience/${id}`, { method: 'DELETE' })
    if (res.ok) load()
    else setError(res.error ?? 'Delete failed')
  }

  return (
    <div className="flex flex-col gap-7 px-5 py-8 md:gap-10 md:px-10 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded px-3 py-2 font-body text-sm font-semibold text-[var(--bg)] transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--gold)', borderRadius: '3px' }}
        >
          <Plus className="h-4 w-4" />
          Add experience
        </button>
      </div>

      <h1
        className="font-heading text-2xl text-text"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Experience
      </h1>

      {error && (
        <div className="rounded border border-red-500/50 bg-red-500/10 px-4 py-3 font-body text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="font-body text-muted">Loading…</p>
      ) : !defaultProfileId && list.length === 0 ? (
        <div className="rounded border border-b1 bg-s1 p-6">
          <p className="font-body text-muted mb-2">
            You need a resume profile before adding experience. Create one from the Dashboard (or use Generate Resume to set up a profile).
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-body text-sm font-medium text-gold hover:underline"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : list.length === 0 && !formOpen ? (
        <div className="rounded border border-b1 bg-s1 p-8 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted mb-3" stroke="var(--muted)" />
          <p className="font-body text-muted mb-4">No experience entries yet.</p>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded px-3 py-2 font-body text-sm font-semibold text-[var(--bg)]"
            style={{ backgroundColor: 'var(--gold)', borderRadius: '3px' }}
          >
            <Plus className="h-4 w-4" />
            Add experience
          </button>
        </div>
      ) : (
        <div className="grid gap-px overflow-hidden rounded border border-b1 bg-b1" style={{ borderRadius: '4px' }}>
          {list.map((e) => (
            <div
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-3 bg-s1 p-4 transition-colors hover:bg-s2"
            >
              <div>
                <p className="font-body font-semibold text-text">{e.role}</p>
                <p className="font-body text-sm text-muted">{e.company}</p>
                {(e.start_date || e.end_date) && (
                  <p className="font-mono text-xs text-muted2 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                    {e.start_date?.slice(0, 10)} – {e.is_current ? 'Present' : (e.end_date?.slice(0, 10) ?? '—')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(e)}
                  className="rounded p-2 text-muted hover:bg-s2 hover:text-gold transition-colors"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className="rounded p-2 text-muted hover:bg-s2 hover:text-red-400 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md rounded border border-b1 bg-s1 p-6 shadow-xl">
            <h2 className="font-heading text-lg text-text mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {editingId ? 'Edit experience' : 'Add experience'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Role</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
                  placeholder="Job title"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
                  placeholder="City, Country"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Start</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>End</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text focus:border-gold focus:outline-none"
                    disabled={form.is_current}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 font-body text-sm text-text">
                <input
                  type="checkbox"
                  checked={form.is_current}
                  onChange={(e) => setForm((f) => ({ ...f, is_current: e.target.checked }))}
                  className="rounded border-b2 text-gold focus:ring-gold"
                />
                Currently working here
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded px-3 py-2 font-body text-sm font-medium text-muted hover:bg-s2 hover:text-text"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded px-3 py-2 font-body text-sm font-semibold text-[var(--bg)] disabled:opacity-50"
                style={{ backgroundColor: 'var(--gold)', borderRadius: '3px' }}
              >
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
