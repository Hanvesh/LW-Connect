'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import { useState } from 'react';
import { Calendar, Star, Award, Clock, BookOpen, ArrowLeft } from 'lucide-react';

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
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-semibold text-indigo-600">
              {mentor.name?.charAt(0) || 'M'}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{mentor.name}</h1>
                <p className="text-lg text-gray-600 mt-1">{mentor.title || 'Mentor'}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1 text-gray-900 font-medium">5.0</span>
                    <span className="ml-1 text-gray-500">(0 reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-5 h-5" />
                    <span className="ml-1">0 sessions</span>
                  </div>
                </div>
              </div>

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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">
              {mentor.bio || 'Experienced mentor ready to help you achieve your goals.'}
            </p>
          </div>

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
              )) || (
                <span className="text-gray-500">No expertise listed</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Response time: &lt; 24 hours</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Next available: This week</span>
              </div>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              View Calendar
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sessions</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-gray-900">95%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold text-gray-900">2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">Book Session with {mentor.name}</h2>
            <p className="text-gray-600 mb-4">Select a time slot to book your session.</p>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Continue to Booking
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
