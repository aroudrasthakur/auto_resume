'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useDisplayUser } from '@/lib/use-display-user'
import { useInvalidateDashboardData } from '@/lib/use-dashboard-data'
import { apiFetch } from '@/lib/api'
import { ArrowLeft, Mail, Briefcase, GraduationCap, Plus, Pencil, MapPin, FileText, Code2, Wrench } from 'lucide-react'

interface Contact {
  contact_kind: string
  label?: string
  value: string
}

interface ProfileData {
  id: string
  name: string
  headline?: string
  summary?: string
  location?: string
  contacts: { id: string; contact_kind: string; label?: string; value: string }[]
}

const CONTACT_LABELS: Record<string, string> = {
  email: 'Email',
  phone: 'Phone',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  website: 'Website',
}

function ProfileView({ profile, onEdit }: { profile: ProfileData; onEdit: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>
            {profile.name}
          </h3>
          {profile.headline && (
            <p className="mt-1 font-body text-muted">{profile.headline}</p>
          )}
          {profile.location && (
            <p className="mt-1 flex items-center gap-2 font-body text-sm text-muted">
              <MapPin className="h-4 w-4 shrink-0" />
              {profile.location}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded border border-b2 px-3 py-2 font-body text-sm text-text hover:border-gold hover:text-gold transition-colors"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
      </div>

      {profile.summary && (
        <div>
          <h4 className="font-mono text-xs uppercase text-muted mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
            Summary
          </h4>
          <p className="font-body text-text whitespace-pre-wrap">{profile.summary}</p>
        </div>
      )}

      {profile.contacts && profile.contacts.length > 0 && (
        <div>
          <h4 className="font-mono text-xs uppercase text-muted mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
            Contact
          </h4>
          <ul className="space-y-2">
            {profile.contacts.map((c) => (
              <li key={c.id} className="flex items-center gap-2 font-body text-text">
                <Mail className="h-4 w-4 shrink-0 text-muted" />
                <span className="text-muted w-20">{CONTACT_LABELS[c.contact_kind] || c.contact_kind}</span>
                <span>{c.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function EmptyProfileView({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-b2 text-muted mb-4">
        <FileText className="h-8 w-8" />
      </div>
      <p className="font-body text-muted mb-4">No profile added yet.</p>
      <p className="font-body text-sm text-muted mb-6 max-w-sm">
        Add your name, headline, summary, and contact info to build your resume.
      </p>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-2 rounded px-4 py-2.5 font-body text-sm font-semibold text-[var(--bg)] transition-transform hover:scale-[1.02]"
        style={{ backgroundColor: 'var(--gold)', borderRadius: '3px' }}
      >
        <Plus className="h-4 w-4" />
        Add profile
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const { displayName, initial, email: userEmail } = useDisplayUser()
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingProfile, setEditingProfile] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    summary: '',
    location: '',
    contacts: [] as Contact[],
  })

  const currentProfile = profiles.length > 0 ? profiles[0] : null
  const invalidateDashboard = useInvalidateDashboardData()

  const fetchProfiles = async () => {
    setError(null)
    const res = await apiFetch<ProfileData[]>('/profiles')
    if (res.ok && res.data !== undefined) {
      const data = Array.isArray(res.data) ? res.data : []
      setProfiles(data)
    } else {
      setError(res.error ?? 'Failed to load profiles.')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  useEffect(() => {
    if (isEditing && currentProfile) {
      setEditingProfile(currentProfile)
      setFormData({
        name: currentProfile.name || '',
        headline: currentProfile.headline || '',
        summary: currentProfile.summary || '',
        location: currentProfile.location || '',
        contacts: (currentProfile.contacts || []).map((c) => ({
          contact_kind: c.contact_kind,
          label: c.label,
          value: c.value,
        })),
      })
    } else if (isEditing && !currentProfile) {
      setEditingProfile(null)
      setFormData({
        name: displayName || '',
        headline: '',
        summary: '',
        location: '',
        contacts: [],
      })
    }
  }, [isEditing, currentProfile?.id, currentProfile, displayName])

  const handleCreateContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { contact_kind: 'email', label: '', value: '' }],
    }))
  }

  const handleContactChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }))
  }

  const handleRemoveContact = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: formData.name || displayName || 'Resume',
      headline: formData.headline || undefined,
      summary: formData.summary || undefined,
      location: formData.location || undefined,
      contacts: formData.contacts.filter((c) => c.value.trim()).map((c) => ({
        contact_kind: c.contact_kind,
        label: c.label || undefined,
        value: c.value,
      })),
    }

    try {
      if (editingProfile) {
        const res = await apiFetch<ProfileData>(`/profiles/${editingProfile.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        if (res.ok && res.data) {
          const updated = res.data
          setProfiles([updated])
          setEditingProfile(updated)
          setFormData({
            name: updated.name || '',
            headline: updated.headline || '',
            summary: updated.summary || '',
            location: updated.location || '',
            contacts: (updated.contacts || []).map((c) => ({
              contact_kind: c.contact_kind,
              label: c.label,
              value: c.value,
            })),
          })
          setIsEditing(false)
          invalidateDashboard()
        } else {
          setError(res.error ?? 'Failed to update profile')
        }
      } else {
        const res = await apiFetch<ProfileData>('/profiles', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        if (res.ok && res.data) {
          const created = res.data
          setProfiles([created])
          setEditingProfile(created)
          setFormData({
            name: created.name || '',
            headline: created.headline || '',
            summary: created.summary || '',
            location: created.location || '',
            contacts: (created.contacts || []).map((c) => ({
              contact_kind: c.contact_kind,
              label: c.label,
              value: c.value,
            })),
          })
          setIsEditing(false)
          invalidateDashboard()
        } else {
          setError(res.error ?? 'Failed to create profile')
        }
      }
    } catch (err) {
      console.error(err)
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (currentProfile) {
      setFormData({
        name: currentProfile.name || '',
        headline: currentProfile.headline || '',
        summary: currentProfile.summary || '',
        location: currentProfile.location || '',
        contacts: (currentProfile.contacts || []).map((c) => ({
          contact_kind: c.contact_kind,
          label: c.label,
          value: c.value,
        })),
      })
    }
  }

  const inputClass = 'w-full rounded border border-b1 bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-gold focus:outline-none'
  const labelClass = 'mb-1 block font-mono text-xs uppercase text-muted'
  const labelStyle = { fontFamily: 'var(--font-mono)' }

  return (
    <div className="flex flex-col gap-7 px-5 py-8 md:gap-10 md:px-10 md:py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-gold transition-colors" style={labelStyle}>
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <h1 className="font-heading text-2xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>
        Profile
      </h1>

      {/* Account (Cognito) */}
      <div className="rounded border border-b1 bg-s1 overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 p-6 md:p-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-b2 font-heading text-3xl font-semibold text-gold" style={{ borderColor: 'var(--b2)', fontFamily: 'var(--font-heading)' }}>
            {initial}
          </div>
          <div>
            <h2 className="font-heading text-xl text-text" style={{ fontFamily: 'var(--font-heading)' }}>{displayName}</h2>
            {userEmail && (
              <p className="mt-1 flex items-center gap-2 font-body text-sm text-muted">
                <Mail className="h-4 w-4" />
                {userEmail}
              </p>
            )}
          </div>
        </div>
        <div className="border-t border-b1 px-6 py-4">
          <p className="font-body text-xs text-muted">Account information is managed through AWS Cognito.</p>
        </div>
      </div>

      {/* Resume Profile */}
      <div className="rounded border border-b1 bg-s1 overflow-hidden">
        <div className="border-b border-b1 px-6 py-4">
          <h2 className="font-heading text-lg text-text" style={{ fontFamily: 'var(--font-heading)' }}>Resume profile</h2>
          <p className="mt-1 font-body text-sm text-muted">
            Name, contact info, and resume details used when generating resumes.
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-8">
            <p className="font-body text-muted">Loading…</p>
          </div>
        ) : isEditing ? (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            {error && (
              <div className="rounded border border-red-500/50 bg-red-500/10 px-4 py-3 font-body text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className={labelClass} style={labelStyle}>Full name *</label>
              <input id="name" type="text" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="headline" className={labelClass} style={labelStyle}>Headline</label>
              <input id="headline" type="text" value={formData.headline} onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))} placeholder="e.g. Software Engineer" className={inputClass} />
            </div>
            <div>
              <label htmlFor="summary" className={labelClass} style={labelStyle}>Summary</label>
              <textarea id="summary" rows={3} value={formData.summary} onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))} placeholder="Brief professional summary" className={inputClass} />
            </div>
            <div>
              <label htmlFor="location" className={labelClass} style={labelStyle}>Location</label>
              <input id="location" type="text" value={formData.location} onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))} placeholder="e.g. San Francisco, CA" className={inputClass} />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className={labelClass} style={labelStyle}>Contacts (at least one for resume)</label>
                <button type="button" onClick={handleCreateContact} className="font-body text-sm font-medium text-gold hover:underline">
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add
                </button>
              </div>
              {formData.contacts.length === 0 && (
                <button type="button" onClick={handleCreateContact} className="mt-2 w-full rounded border border-dashed border-b2 py-2 font-body text-sm text-muted hover:border-gold hover:text-gold transition-colors">
                  Add email, phone, LinkedIn, etc.
                </button>
              )}
              {formData.contacts.map((contact, i) => (
                <div key={i} className="flex gap-2 mt-2">
                  <select
                    value={contact.contact_kind}
                    onChange={(e) => handleContactChange(i, 'contact_kind', e.target.value)}
                    className="w-32 rounded border border-b1 bg-bg px-3 py-2 font-body text-text focus:border-gold focus:outline-none"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="github">GitHub</option>
                    <option value="website">Website</option>
                  </select>
                  <input type="text" value={contact.value} onChange={(e) => handleContactChange(i, 'value', e.target.value)} placeholder={contact.contact_kind === 'email' ? 'email@example.com' : 'Value'} className={`flex-1 ${inputClass}`} />
                  <button type="button" onClick={() => handleRemoveContact(i)} className="shrink-0 rounded px-2 py-1 font-body text-sm text-muted hover:text-red-400 transition-colors">Remove</button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded py-2.5 font-body text-sm font-semibold text-[var(--bg)] disabled:opacity-50 transition-transform hover:scale-[1.01]"
                style={{ backgroundColor: 'var(--gold)', borderRadius: '3px' }}
              >
                {saving ? 'Saving…' : editingProfile ? 'Update profile' : 'Create profile'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded border border-b2 px-4 py-2.5 font-body text-sm text-text hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : currentProfile ? (
          <div className="px-6 py-6">
            <ProfileView profile={currentProfile} onEdit={() => setIsEditing(true)} />
          </div>
        ) : (
          <div className="px-6 py-6">
            <EmptyProfileView onEdit={() => setIsEditing(true)} />
          </div>
        )}

        {profiles.length > 0 && !isEditing && (
          <div className="border-t border-b1 px-6 py-4">
            <h3 className="font-mono text-xs uppercase text-muted mb-3" style={labelStyle}>Next steps</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/education" className="inline-flex items-center gap-2 rounded border border-b2 px-3 py-2 font-body text-sm text-text hover:border-gold hover:text-gold transition-colors">
                <GraduationCap className="w-4 h-4" />
                Add education
              </Link>
              <Link href="/experience" className="inline-flex items-center gap-2 rounded border border-b2 px-3 py-2 font-body text-sm text-text hover:border-gold hover:text-gold transition-colors">
                <Briefcase className="w-4 h-4" />
                Add experience
              </Link>
              <Link href="/projects" className="inline-flex items-center gap-2 rounded border border-b2 px-3 py-2 font-body text-sm text-text hover:border-gold hover:text-gold transition-colors">
                <Code2 className="w-4 h-4" />
                Add projects
              </Link>
              <Link href="/skills" className="inline-flex items-center gap-2 rounded border border-b2 px-3 py-2 font-body text-sm text-text hover:border-gold hover:text-gold transition-colors">
                <Wrench className="w-4 h-4" />
                Add skills
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
