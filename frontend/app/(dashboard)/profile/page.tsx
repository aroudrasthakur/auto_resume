'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { User, Mail, UserCircle, Briefcase, GraduationCap, Plus } from 'lucide-react'

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

export default function ProfilePage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    summary: '',
    location: '',
    contacts: [] as Contact[],
  })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  })

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/v1/profiles`, { headers: getAuthHeaders() })
        if (res.ok) {
          const data = await res.json()
          setProfiles(data)
          if (data.length > 0) {
            setEditingProfile(data[0])
            setFormData({
              name: data[0].name || '',
              headline: data[0].headline || '',
              summary: data[0].summary || '',
              location: data[0].location || '',
              contacts: (data[0].contacts || []).map((c: { contact_kind: string; label?: string; value: string }) => ({
                contact_kind: c.contact_kind,
                label: c.label,
                value: c.value,
              })),
            })
          }
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load profiles')
      } finally {
        setLoading(false)
      }
    }
    fetchProfiles()
  }, [])

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
      name: formData.name || user?.name || 'Resume',
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
        const res = await fetch(`${apiUrl}/api/v1/profiles/${editingProfile.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const updated = await res.json()
          setProfiles([updated])
          setEditingProfile(updated)
          setFormData({
            name: updated.name || '',
            headline: updated.headline || '',
            summary: updated.summary || '',
            location: updated.location || '',
            contacts: (updated.contacts || []).map((c: { contact_kind: string; label?: string; value: string }) => ({
              contact_kind: c.contact_kind,
              label: c.label,
              value: c.value,
            })),
          })
        } else {
          const err = await res.json()
          setError(err.detail || 'Failed to update profile')
        }
      } else {
        const res = await fetch(`${apiUrl}/api/v1/profiles`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const created = await res.json()
          setProfiles([created])
          setEditingProfile(created)
          setFormData({
            name: created.name || '',
            headline: created.headline || '',
            summary: created.summary || '',
            location: created.location || '',
            contacts: (created.contacts || []).map((c: { contact_kind: string; label?: string; value: string }) => ({
              contact_kind: c.contact_kind,
              label: c.label,
              value: c.value,
            })),
          })
        } else {
          const err = await res.json()
          setError(err.detail || 'Failed to create profile')
        }
      }
    } catch (err) {
      console.error(err)
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile</h1>
        <p className="text-slate-600">Manage your account and resume profile</p>
      </div>

      {/* Cognito Account Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
              {user?.nickname?.charAt(0).toUpperCase() || user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">
                {user?.nickname || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.name) || 'User'}
              </h2>
              {user?.email && (
                <p className="text-white/80 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Account information is managed through AWS Cognito.
          </p>
        </div>
      </div>

      {/* Resume Profile Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Resume Profile</h2>
          <p className="text-sm text-slate-500">
            Add your name, contact info, and resume details. This is used when generating resumes.
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-8">
            <p className="text-slate-600">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-slate-700">
                Headline
              </label>
              <input
                id="headline"
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))}
                placeholder="e.g. Software Engineer"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-slate-700">
                Summary
              </label>
              <textarea
                id="summary"
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief professional summary"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. San Francisco, CA"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Contacts (at least one required for resume)
                </label>
                <button
                  type="button"
                  onClick={handleCreateContact}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add contact
                </button>
              </div>
              {formData.contacts.length === 0 && (
                <button
                  type="button"
                  onClick={handleCreateContact}
                  className="mt-2 text-sm text-slate-500 border border-dashed border-slate-300 rounded-md px-4 py-2 hover:border-violet-400 hover:text-violet-600"
                >
                  Add email, phone, LinkedIn, etc.
                </button>
              )}
              {formData.contacts.map((contact, i) => (
                <div key={i} className="flex gap-2 mt-2">
                  <select
                    value={contact.contact_kind}
                    onChange={(e) => handleContactChange(i, 'contact_kind', e.target.value)}
                    className="rounded-md border-slate-300 shadow-sm sm:text-sm w-32"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="github">GitHub</option>
                    <option value="website">Website</option>
                  </select>
                  <input
                    type="text"
                    value={contact.value}
                    onChange={(e) => handleContactChange(i, 'value', e.target.value)}
                    placeholder={contact.contact_kind === 'email' ? 'email@example.com' : 'Value'}
                    className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(i)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingProfile ? 'Update Profile' : 'Create Profile'}
            </button>
          </form>
        )}

        {profiles.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Next steps</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/experience"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200"
              >
                <Briefcase className="w-4 h-4" />
                Add experience
              </Link>
              <Link
                href="/education"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200"
              >
                <GraduationCap className="w-4 h-4" />
                Add education
              </Link>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700"
              >
                Generate resume
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
