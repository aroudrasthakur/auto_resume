'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export interface ProfileCompleteness {
  is_complete: boolean
  missing_sections: string[]
  profile_id?: string
}

export interface DashboardData {
  completeness: ProfileCompleteness | null
  experiencesCount: number
  resumesCount: number
  skillsCount: number
}

const DASHBOARD_QUERY_KEY = ['dashboard'] as const

async function fetchDashboardData(): Promise<DashboardData> {
  const [checkRes, expRes, resumesRes, skillsRes] = await Promise.all([
    apiFetch<ProfileCompleteness>('/profiles/check'),
    apiFetch<unknown[]>('/experience'),
    apiFetch<unknown[]>('/resumes'),
    apiFetch<unknown[]>('/skills/categories'),
  ])

  return {
    completeness: checkRes.ok && checkRes.data ? checkRes.data : null,
    experiencesCount: expRes.ok && Array.isArray(expRes.data) ? expRes.data.length : 0,
    resumesCount: resumesRes.ok && Array.isArray(resumesRes.data) ? resumesRes.data.length : 0,
    skillsCount: skillsRes.ok && Array.isArray(skillsRes.data) ? skillsRes.data.length : 0,
  }
}

/**
 * Fetches and caches dashboard data. Data is loaded only:
 * - On first use (boot-up when dashboard is visited)
 * - When invalidateDashboardData() is called after a profile-related change
 *
 * No refetch on window focus. Cache is kept in memory for the session.
 */
export function useDashboardData() {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: fetchDashboardData,
    staleTime: Infinity, // Never auto-refetch; only when explicitly invalidated
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // refetchOnMount: default true - when invalidated, refetch on next dashboard visit
  })

  return {
    completeness: query.data?.completeness ?? null,
    experiencesCount: query.data?.experiencesCount ?? 0,
    resumesCount: query.data?.resumesCount ?? 0,
    skillsCount: query.data?.skillsCount ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  }
}

/**
 * Call this after creating, updating, or deleting profile-related data
 * (profile, education, experience, projects, skills, resumes).
 * Triggers a refetch so the dashboard shows fresh data.
 */
export function useInvalidateDashboardData() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
}
