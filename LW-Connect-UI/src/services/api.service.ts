import api from '@/lib/api'
import { sendChatMessage } from '@/lib/ai-api'
import { mapBackendUser } from '@/lib/user-mapper'
import { User } from '@/types'

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    })
    localStorage.setItem('token', data.access_token)
    return { ...data, user: mapBackendUser(data.user) }
  },

  signup: async (email: string, password: string, fullName: string, role: string) => {
    const { data } = await api.post('/auth/signup', {
      email: email.trim().toLowerCase(),
      password,
      full_name: fullName,
      role,
    })
    localStorage.setItem('token', data.access_token)
    return { ...data, user: mapBackendUser(data.user) }
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get('/auth/me')
    return mapBackendUser(data)
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
  getMyBookings: async () => {
    const { data } = await api.get('/bookings/learner/my-bookings')
    return data
  },

  getMentorBookings: async () => {
    const { data } = await api.get('/bookings/mentor/my-bookings')
    return data
  },

  bookSession: async (mentorId: string, scheduledAt: string, notes?: string) => {
    const { data } = await api.post('/bookings', {
      mentor_id: mentorId,
      scheduled_at: scheduledAt,
      notes,
    })
    return data
  },

  setMeetingLink: async (bookingId: string, meetingUrl: string) => {
    const { data } = await api.put(`/bookings/${bookingId}/meeting-link`, null, {
      params: { meeting_url: meetingUrl },
    })
    return data
  },

  updateBooking: async (bookingId: string, updates: Record<string, unknown>) => {
    const { data } = await api.put(`/bookings/${bookingId}`, updates)
    return data
  },

  submitFeedback: async (bookingId: string, rating: number, comment?: string) => {
    const { data } = await api.post('/bookings/feedback', {
      booking_id: bookingId,
      rating,
      comment,
    })
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

export const cohortService = {
  getAvailableCohorts: async () => {
    const { data } = await api.get('/cohorts')
    return data
  },

  getMyEnrollments: async () => {
    const { data } = await api.get('/cohorts/my-enrollments')
    return data
  },

  enrollInCohort: async (cohortId: string) => {
    const { data } = await api.post(`/cohorts/${cohortId}/enroll/me`)
    return data
  },
}

export const aiService = {
  chat: async (message: string, userId: string, sessionId?: string) => {
    return sendChatMessage(message, userId, sessionId)
  },

  getRecommendations: async (userId: string) => {
    const { data } = await api.get(`/ai/recommendations/${userId}`)
    return data
  },
}

export const adminService = {
  getDashboardMetrics: async () => {
    const { data } = await api.get('/dashboard/metrics')
    return data
  },

  getCohorts: async () => {
    const { data } = await api.get('/cohorts')
    return data
  },

  createCohort: async (cohort: {
    name: string
    course_id: string
    description?: string
    start_date?: string
    end_date?: string
    max_participants?: number
    is_active?: boolean
  }) => {
    const { data } = await api.post('/cohorts', cohort)
    return data
  },

  updateCohort: async (id: string, updates: Record<string, unknown>) => {
    const { data } = await api.put(`/cohorts/${id}`, updates)
    return data
  },

  getUsers: async () => {
    const { data } = await api.get('/users')
    return data
  },

  createUser: async (user: {
    email: string
    password: string
    full_name: string
    role: string
  }) => {
    const { data } = await api.post('/users', user)
    return mapBackendUser(data)
  },

  updateUser: async (id: string, updates: Record<string, unknown>) => {
    const { data } = await api.put(`/users/${id}`, updates)
    return mapBackendUser(data)
  },
}
