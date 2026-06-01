'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { MaterialIcon } from '@/components/ui/material-icon';

interface UserPreferences {
  preferred_topics?: string[];
  blocked_topics?: string[];
}

interface PreferencesIndicatorProps {
  variant?: 'compact' | 'detailed' | 'inline';
  showEditLink?: boolean;
  className?: string;
}

export default function PreferencesIndicator({ 
  variant = 'compact', 
  showEditLink = true,
  className = '' 
}: PreferencesIndicatorProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/v1/preferences/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!preferences || (!preferences.preferred_topics?.length && !preferences.blocked_topics?.length)) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        <MaterialIcon name="interests" className="inline mr-1" />
        No topic preferences set
        {showEditLink && (
          <a href="/preferences" className="ml-2 text-primary hover:underline">
            Set up preferences
          </a>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <MaterialIcon name="interests" className="text-gray-400" />
        <span className="text-gray-600">
          {preferences.preferred_topics?.length || 0} topics
        </span>
        {showEditLink && (
          <a href="/preferences" className="text-primary hover:underline ml-2">
            Edit
          </a>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <MaterialIcon name="interests" className="text-gray-400 text-sm" />
        <div className="flex gap-1">
          {preferences.preferred_topics && preferences.preferred_topics.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {preferences.preferred_topics.length} topics
            </Badge>
          )}
        </div>
        {showEditLink && (
          <a href="/preferences" className="text-xs text-primary hover:underline">
            Edit
          </a>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm flex items-center">
          <MaterialIcon name="interests" className="mr-2" />
          Your Topics
        </h4>
        {showEditLink && (
          <a href="/preferences" className="text-xs text-primary hover:underline">
            Edit preferences
          </a>
        )}
      </div>
      
      <div className="space-y-2">
        {preferences.preferred_topics && preferences.preferred_topics.length > 0 && (
          <div className="text-sm">
            <div className="flex items-center mb-1">
              <MaterialIcon name="favorite" className="mr-2 text-gray-400 text-sm" />
              <span className="text-gray-600">Interested in:</span>
            </div>
            <div className="flex flex-wrap gap-1 ml-6">
              {preferences.preferred_topics.slice(0, 5).map(topic => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
              {preferences.preferred_topics.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{preferences.preferred_topics.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {preferences.blocked_topics && preferences.blocked_topics.length > 0 && (
          <div className="text-sm">
            <div className="flex items-center mb-1">
              <MaterialIcon name="block" className="mr-2 text-gray-400 text-sm" />
              <span className="text-gray-600">Avoiding:</span>
            </div>
            <div className="flex flex-wrap gap-1 ml-6">
              {preferences.blocked_topics.slice(0, 3).map(topic => (
                <Badge key={topic} variant="destructive" className="text-xs">
                  {topic}
                </Badge>
              ))}
              {preferences.blocked_topics.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{preferences.blocked_topics.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
