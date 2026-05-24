export interface User {
  id: string
  email: string
  name: string
  role: 'learner' | 'mentor' | 'admin'
  avatar?: string
  cohort?: string
}

export interface Mentor {
  id: string
  name: string
  title: string
  expertise: string[]
  bio: string
  rating: number
  totalSessions: number
  availability: string
  avatar?: string
  isAvailable: boolean
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  level: 'beginner' | 'intermediate' | 'advanced'
  enrollments: number
  rating: number
}

export interface Session {
  id: string
  mentorId: string
  mentorName: string
  learnerId: string
  learnerName: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  feedback?: string
  rating?: number
}

export interface Cohort {
  id: string
  name: string
  startDate: string
  endDate: string
  learners: number
  mentors: number
  completionRate: number
  engagementScore: number
}

export interface DashboardStats {
  totalLearners: number
  totalMentors: number
  totalSessions: number
  avgEngagement: number
  completionRate: number
  activeCohorts: number
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  recommendations?: Recommendation[]
}

export interface Recommendation {
  type: 'mentor' | 'course'
  id: string
  title: string
  reason: string
}
