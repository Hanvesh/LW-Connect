import api from '@/lib/api'
import { User } from '@/types'

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    return data
  },

  signup: async (email: string, password: string, name: string, role: string) => {
    const { data } = await api.post('/auth/signup', { email, password, name, role })
    localStorage.setItem('token', data.token)
    return data
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get('/auth/me')
    return data
  },
}

export const mentorService = {
  getMentors: async (filters?: any) => {
    const { data } = await api.get('/mentors', { params: filters })
    return data
  },

  getMentor: async (id: string) => {
    const { data } = await api.get(`/mentors/${id}`)
    return data
  },

  updateProfile: async (id: string, profile: any) => {
    const { data } = await api.put(`/mentors/${id}`, profile)
    return data
  },
}

export const sessionService = {
  getSessions: async (userId?: string) => {
    const { data } = await api.get('/sessions', { params: { userId } })
    return data
  },

  bookSession: async (mentorId: string, date: string, time: string) => {
    const { data } = await api.post('/sessions', { mentorId, date, time })
    return data
  },

  updateSession: async (id: string, updates: any) => {
    const { data } = await api.put(`/sessions/${id}`, updates)
    return data
  },

  submitFeedback: async (id: string, feedback: string, rating: number) => {
    const { data } = await api.post(`/sessions/${id}/feedback`, { feedback, rating })
    return data
  },
}

export const courseService = {
  getCourses: async (filters?: any) => {
    const { data } = await api.get('/courses', { params: filters })
    return data
  },

  getCourse: async (id: string) => {
    const { data } = await api.get(`/courses/${id}`)
    return data
  },
}

export const aiService = {
  chat: async (message: string, context?: any) => {
    const { data } = await api.post('/ai/chat', { message, context })
    return data
  },

  getRecommendations: async (userId: string) => {
    const { data } = await api.get(`/ai/recommendations/${userId}`)
    return data
  },
}

export const adminService = {
  getDashboardStats: async () => {
    const { data } = await api.get('/admin/stats')
    return data
  },

  getCohorts: async () => {
    const { data } = await api.get('/admin/cohorts')
    return data
  },

  getUsers: async () => {
    const { data } = await api.get('/admin/users')
    return data
  },

  updateCohort: async (id: string, updates: any) => {
    const { data } = await api.put(`/admin/cohorts/${id}`, updates)
    return data
  },
}
