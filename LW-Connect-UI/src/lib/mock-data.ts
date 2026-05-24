import { Mentor, Course, Session, Cohort, DashboardStats } from '@/types'

export const mockMentors: Mentor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    title: 'Senior Data Scientist',
    expertise: ['Machine Learning', 'Python', 'Data Analysis'],
    bio: 'Experienced data scientist with 10+ years in public sector analytics',
    rating: 4.8,
    totalSessions: 45,
    availability: 'Mon, Wed, Fri',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Product Manager',
    expertise: ['Product Strategy', 'Agile', 'User Research'],
    bio: 'Product leader specializing in government digital transformation',
    rating: 4.9,
    totalSessions: 62,
    availability: 'Tue, Thu',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    title: 'UX Designer',
    expertise: ['UI/UX', 'Design Thinking', 'Accessibility'],
    bio: 'Passionate about creating accessible government services',
    rating: 4.7,
    totalSessions: 38,
    availability: 'Mon, Wed',
    isAvailable: false,
  },
]

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Data Science',
    description: 'Learn the fundamentals of data science and analytics',
    instructor: 'Dr. Sarah Johnson',
    duration: '6 weeks',
    level: 'beginner',
    enrollments: 124,
    rating: 4.6,
  },
  {
    id: '2',
    title: 'Agile Project Management',
    description: 'Master agile methodologies for public sector projects',
    instructor: 'Michael Chen',
    duration: '4 weeks',
    level: 'intermediate',
    enrollments: 89,
    rating: 4.8,
  },
  {
    id: '3',
    title: 'Advanced UX Design',
    description: 'Deep dive into user experience design principles',
    instructor: 'Emily Rodriguez',
    duration: '8 weeks',
    level: 'advanced',
    enrollments: 56,
    rating: 4.9,
  },
]

export const mockSessions: Session[] = [
  {
    id: '1',
    mentorId: '1',
    mentorName: 'Dr. Sarah Johnson',
    learnerId: 'learner1',
    learnerName: 'John Doe',
    date: '2026-05-26',
    time: '10:00',
    duration: 60,
    status: 'scheduled',
  },
  {
    id: '2',
    mentorId: '2',
    mentorName: 'Michael Chen',
    learnerId: 'learner1',
    learnerName: 'John Doe',
    date: '2026-05-20',
    time: '14:00',
    duration: 60,
    status: 'completed',
    notes: 'Discussed product strategy and roadmap planning',
    rating: 5,
  },
]

export const mockCohorts: Cohort[] = [
  {
    id: '1',
    name: 'Innovation Leaders 2026',
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    learners: 45,
    mentors: 12,
    completionRate: 78,
    engagementScore: 85,
  },
  {
    id: '2',
    name: 'Digital Transformation Cohort',
    startDate: '2026-03-01',
    endDate: '2026-08-31',
    learners: 38,
    mentors: 10,
    completionRate: 82,
    engagementScore: 90,
  },
]

export const mockDashboardStats: DashboardStats = {
  totalLearners: 156,
  totalMentors: 28,
  totalSessions: 342,
  avgEngagement: 87,
  completionRate: 79,
  activeCohorts: 3,
}
