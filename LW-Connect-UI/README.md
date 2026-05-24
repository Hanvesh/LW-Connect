# LW-Connect UI

Modern, accessible frontend for LW-Connect (PeopleWave) - a mentorship and learning platform for public-sector innovation programs.

## 🚀 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **HTTP Client**: Axios
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/       # Learner dashboard
│   │   ├── mentors/         # Mentor discovery
│   │   ├── courses/         # Course catalog
│   │   ├── ai-assistant/    # AI chat interface
│   │   ├── sessions/        # Session management
│   │   ├── admin/           # Admin pages
│   │   └── mentor/          # Mentor pages
│   ├── login/               # Authentication
│   ├── about/               # About page
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── features/            # Feature-specific components
│   └── layout/              # Layout components
├── lib/
│   ├── api.ts               # Axios instance
│   ├── utils.ts             # Utility functions
│   └── mock-data.ts         # Demo data
├── services/
│   └── api.service.ts       # API service layer
├── store/
│   └── auth.store.ts        # Zustand stores
└── types/
    └── index.ts             # TypeScript types
```

## 🎨 Key Features

### For Learners
- **Dashboard**: Overview of sessions, progress, and recommendations
- **Mentor Discovery**: Search and filter mentors by expertise
- **2-Click Booking**: Streamlined session booking flow
- **AI Assistant**: Conversational interface for personalized guidance
- **Course Catalog**: Browse and enroll in courses
- **Session History**: Track completed and upcoming sessions

### For Mentors
- **Mentor Dashboard**: Session overview and feedback
- **Availability Management**: Set and manage availability
- **Session Notes**: Document session outcomes
- **Profile Editor**: Update expertise and bio

### For Admins
- **Analytics Dashboard**: Platform-wide metrics and insights
- **Cohort Management**: Create and monitor learning cohorts
- **User Management**: Manage learners and mentors
- **Engagement Reports**: Track completion and engagement rates

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 🎭 Demo Access

The login page includes demo access buttons:
- **Demo as Learner**: Access learner features
- **Demo as Mentor**: Access mentor features  
- **Demo as Admin**: Access admin features

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6) - Actions, links, primary buttons
- **Secondary**: Gray - Secondary actions
- **Success**: Green - Positive states
- **Warning**: Yellow - Caution states
- **Destructive**: Red - Errors, deletions

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, tracking-tight
- **Body**: Regular, comfortable line-height

### Components
All components follow accessibility best practices:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Color contrast compliance

## 📱 Responsive Design

- **Mobile**: < 768px - Single column, touch-optimized
- **Tablet**: 768px - 1024px - Two columns
- **Desktop**: > 1024px - Full layout with sidebar

## 🔌 API Integration

### Authentication
```typescript
// Login
await authService.login(email, password)

// Get current user
await authService.getCurrentUser()
```

### Mentors
```typescript
// Get all mentors
await mentorService.getMentors(filters)

// Book session
await sessionService.bookSession(mentorId, date, time)
```

### AI Assistant
```typescript
// Send message
await aiService.chat(message, context)

// Get recommendations
await aiService.getRecommendations(userId)
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Required for production:
```
NEXT_PUBLIC_API_URL=https://api.lw-connect.com/api
NEXT_PUBLIC_APP_NAME=LW-Connect
```

## 🧪 Development

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for formatting (recommended)

### Component Guidelines
- Use functional components with hooks
- Implement proper TypeScript types
- Follow accessibility standards
- Keep components focused and reusable

### State Management
- **Server State**: React Query (caching, refetching)
- **Client State**: Zustand (auth, UI state)
- **Form State**: React hooks (useState)

## 📊 Performance

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Dynamic imports for heavy components
- **Caching**: React Query with 60s stale time

## ♿ Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Color contrast ratios meet standards

## 🤝 Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Test on multiple screen sizes
4. Ensure accessibility compliance
5. Update documentation as needed

## 📄 License

Proprietary - LW-Connect (PeopleWave)

## 🆘 Support

For issues or questions:
- Check documentation
- Review mock data in `src/lib/mock-data.ts`
- Verify API endpoint configuration
- Test with demo accounts

---

Built with ❤️ for public-sector innovation
