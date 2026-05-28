import { User } from '@/types'

export interface BackendUser {
  id: string
  email: string
  full_name: string
  role: 'learner' | 'mentor' | 'admin'
}

export function mapBackendUser(user: BackendUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role,
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string }
    return first.msg || fallback
  }
  return fallback
}
