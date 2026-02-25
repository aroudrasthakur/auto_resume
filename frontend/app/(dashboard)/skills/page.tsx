'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Wrench, Plus, Trash2 } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useInvalidateDashboardData } from '@/lib/use-dashboard-data'

interface Profile {
  id: string
  name: string
}

interface SkillItem {
  id: string
  item: string
}

interface SkillCategory {
  id: string
  profile_id: string
  name: string
  sort_order: number
  skill_item?: SkillItem[]
}

export default function SkillsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    categoryName: '',
    items: [''] as string[],
  })

  const invalidateDashboard = useInvalidateDashboardData()

  const fetchData = useCallback(async () => {
    const [profilesRes, categoriesRes] = await Promise.all([
      apiFetch<Profile[]>('/profiles'),
      apiFetch<SkillCategory[]>('/skills/categories'),
    ])
    if (profilesRes.ok && Array.isArray(profilesRes.data)) {
      setProfiles(profilesRes.data)
      if (profilesRes.data.length > 0 && !selectedProfileId) {
        setSelectedProfileId(profilesRes.data[0].id)
      }
    }
    if (categoriesRes.ok && Array.isArray(categoriesRes.data)) {
      setCategories(categoriesRes.data)
    }
    setLoading(false)
  }, [selectedProfileId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) setSelectedProfileId(profiles[0].id)
  }, [profiles])

  const filteredCategories = categories.filter((c) => c.profile_id === selectedProfileId)

  const addItem = () => {
    setFormData((p) => ({ ...p, items: [...p.items, ''] }))
  }

  const updateItem = (i: number, v: string) => {
    setFormData((p) => ({
      ...p,
      items: p.items.map((it, j) => (j === i ? v : it)),
    }))
  }

  const removeItem = (i: number) => {
    setFormData((p) => ({ ...p, items: p.items.filter((_, j) => j !== i) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfileId) return
    setSaving(true)
    try {
      const createRes = await apiFetch<SkillCategory>('/skills/categories', {
        method: 'POST',
        body: JSON.stringify({
          profile_id: selectedProfileId,
          name: formData.categoryName,
          sort_order: categories.length,
        }),
      })
      if (createRes.ok && createRes.data) {
        const itemsToAdd = formData.items.filter((it) => it.trim())
        if (itemsToAdd.length > 0) {
          await apiFetch(`/skills/categories/${createRes.data.id}/items`, {
            method: 'POST',
            body: JSON.stringify({ items: itemsToAdd }),
          })
        }
        setFormData({ categoryName: '', items: [''] })
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
    if (!confirm('Delete this skill category and all its items?')) return
    const res = await apiFetch(`/skills/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchData()
      invalidateDashboard()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-7 px-5 py-8 md:px-10 md:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold" style={{ fontFamily: 'var(--font-mono)' }}>← Dashboard</Link>
        <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Skills</h1>
        <p className="font-body text-muted">Loading…</p>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col gap-7 px-5 py-8 md:px-10 md:py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold" style={{ fontFamily: 'var(--font-mono)' }}>← Dashboard</Link>
        <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Skills</h1>
        <div className="rounded border border-b1 bg-s1 p-6">
          <p className="font-body text-muted mb-2">Create a profile first before adding skills.</p>
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
            Add skill category
          </button>
        )}
      </div>

      <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>Skills</h1>

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
          <h2 className="font-heading text-lg text-text" style={{ fontFamily: 'var(--font-heading)' }}>New skill category</h2>
          <div>
            <label className="mb-1 block font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Category name *</label>
            <input
              type="text"
              value={formData.categoryName}
              onChange={(e) => setFormData((p) => ({ ...p, categoryName: e.target.value }))}
              required
              placeholder="e.g. Programming Languages, Tools"
              className="w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-xs uppercase text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Skills (at least one)</label>
              <button type="button" onClick={addItem} className="font-body text-sm text-gold hover:underline">
                <Plus className="w-4 h-4 inline" /> Add
              </button>
            </div>
            {formData.items.map((it, i) => (
              <div key={i} className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={it}
                  onChange={(e) => updateItem(i, e.target.value)}
                  placeholder="e.g. Python, React"
                  className="flex-1 rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none"
                />
                <button type="button" onClick={() => removeItem(i)} disabled={formData.items.length === 1} className="rounded p-2 text-muted hover:bg-s2 hover:text-red-400 disabled:opacity-40">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !formData.items.some((it) => it.trim())}
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
        {filteredCategories.length === 0 ? (
          <div className="rounded border border-b1 bg-s1 p-6 text-center font-body text-muted">
            No skill categories yet. Add your first one above.
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.id} className="flex justify-between items-start gap-4 rounded border border-b1 bg-s1 p-4 hover:bg-s2 transition-colors">
              <div className="min-w-0">
                <h3 className="font-body font-semibold text-text">{cat.name}</h3>
                {(cat.skill_item?.length ?? 0) > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cat.skill_item!.map((item) => (
                      <span
                        key={item.id}
                        className="inline-block rounded border border-b2 px-2 py-0.5 font-body text-sm text-muted"
                        style={{ borderColor: 'var(--b2)' }}
                      >
                        {item.item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => handleDelete(cat.id)} className="shrink-0 rounded p-2 text-muted hover:bg-s2 hover:text-red-400" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
