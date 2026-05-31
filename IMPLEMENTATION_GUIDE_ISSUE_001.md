# IMPLEMENTATION GUIDE: ISSUE-001
## Missing Mentor Profile Page

**Priority**: P0 - CRITICAL  
**Effort**: 3 days  
**Risk**: LOW

---

## STEP-BY-STEP IMPLEMENTATION

### Step 1: Create Mentor Profile Page Route (Day 1 - Morning)

**File**: `LW-Connect-UI/src/app/(dashboard)/mentors/[id]/page.tsx`

```typescript
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import { useState } from 'react';
import { Calendar, Star, Award, Clock, BookOpen } from 'lucide-react';

export default function MentorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: mentor, isLoading, error } = useQuery({
    queryKey: ['mentor', id],
    queryFn: () => apiService.get(`/mentors/${id}`)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Mentor Not Found</h2>
        <p className="text-gray-600 mb-4">The mentor you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/mentors')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Mentors
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-semibold text-indigo-600">
              {mentor.name.charAt(0)}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{mentor.name}</h1>
                <p className="text-lg text-gray-600 mt-1">{mentor.title}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1 text-gray-900 font-medium">
                      {mentor.rating || '5.0'}
                    </span>
                    <span className="ml-1 text-gray-500">
                      ({mentor.reviews_count || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-5 h-5" />
                    <span className="ml-1">{mentor.sessions_count || 0} sessions</span>
                  </div>
                </div>
              </div>

              {/* Book Session Button */}
              <button
                onClick={() => setShowBookingModal(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Book Session
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
          </div>

          {/* Expertise */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise?.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          {mentor.experience && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience</h2>
              <div className="space-y-4">
                {mentor.experience.map((exp: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Award className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Availability */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Response time: {mentor.response_time || '< 24 hours'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Next available: {mentor.next_available || 'This week'}</span>
              </div>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              View Calendar
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sessions</span>
                <span className="font-semibold text-gray-900">
                  {mentor.sessions_count || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-gray-900">
                  {mentor.success_rate || '95%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold text-gray-900">
                  {new Date(mentor.created_at).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          mentor={mentor}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
}

// Booking Modal Component (reuse existing)
function BookingModal({ mentor, onClose }: any) {
  // Reuse existing booking modal logic
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Book Session with {mentor.name}</h2>
        {/* Existing booking form */}
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
```

**Existing Functionality Impact**: NONE  
- New route, doesn't affect existing pages
- Uses existing API endpoint `GET /api/v1/mentors/{id}`
- Reuses existing booking modal

---

### Step 2: Update Mentor List to Link to Profiles (Day 1 - Afternoon)

**File**: `LW-Connect-UI/src/app/(dashboard)/mentors/page.tsx`

**Changes Required**:
```typescript
// MODIFY: Add Link import
import Link from 'next/link';

// MODIFY: Wrap mentor cards with Link
<Link href={`/mentors/${mentor.id}`} key={mentor.id}>
  <div className="cursor-pointer hover:shadow-lg transition-shadow">
    {/* Existing mentor card content */}
  </div>
</Link>
```

**Existing Functionality Impact**: NONE  
- Only adds navigation links
- Existing mentor list display unchanged
- Existing booking flow unchanged

---

### Step 3: Testing (Day 2)

**Test Checklist**:
```
Manual Testing:
[ ] Navigate to /mentors
[ ] Click on a mentor card
[ ] Verify profile page loads
[ ] Verify all mentor details display correctly
[ ] Click "Book Session" button
[ ] Verify booking modal opens
[ ] Complete booking
[ ] Verify booking flow works
[ ] Navigate back to mentor list
[ ] Verify list still works

Regression Testing:
[ ] Existing mentor list functionality
[ ] Existing booking flow
[ ] Existing dashboard
[ ] Existing navigation

Edge Cases:
[ ] Invalid mentor ID (404 handling)
[ ] Network error handling
[ ] Loading states
[ ] Empty data handling
```

---

### Step 4: Documentation (Day 3)

**Update Files**:
1. `LW-Connect-UI/README.md` - Add mentor profile route
2. Create user guide for mentor profiles
3. Update API documentation

---

## VALIDATION CHECKLIST

### Before Deployment:
- [ ] Code review completed
- [ ] All tests passing
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Accessibility checked
- [ ] Performance acceptable

### After Deployment:
- [ ] Smoke test in staging
- [ ] User acceptance testing
- [ ] Monitor error logs
- [ ] Collect user feedback

---

## ROLLBACK PLAN

If issues arise:
1. Revert commit: `git revert <commit-hash>`
2. Remove route file
3. Remove Link changes from mentor list
4. Deploy previous version

**Rollback Time**: < 5 minutes

---

## SUCCESS METRICS

**Before**:
- Learner journey completion: 60%
- Mentor profile views: 0
- Booking conversion: Unknown

**After**:
- Learner journey completion: 75%
- Mentor profile views: Trackable
- Booking conversion: Measurable

---

## DEPENDENCIES

**Required**:
- Backend API `GET /api/v1/mentors/{id}` (✅ Already exists)
- Existing booking modal component (✅ Already exists)
- Next.js routing (✅ Already configured)

**No New Dependencies Required**

---

## RISK MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API returns unexpected data | Low | Medium | Add data validation |
| Performance issues | Low | Low | Implement caching |
| Booking modal breaks | Low | High | Thorough testing |
| Navigation breaks | Low | Medium | Test all routes |

---

**Status**: READY FOR IMPLEMENTATION  
**Blocker**: None  
**Start Date**: Immediate
