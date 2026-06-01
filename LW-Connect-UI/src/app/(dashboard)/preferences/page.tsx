'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface UserPreferences {
  id?: string;
  preferred_topics?: string[];
  blocked_topics?: string[];
}

interface PreferenceOptions {
  suggested_topics: Array<{
    id: string;
    category: string;
    topic_name: string;
    description: string;
  }>;
}

export default function UserPreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [options, setOptions] = useState<PreferenceOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newBlockedTopic, setNewBlockedTopic] = useState('');

  useEffect(() => {
    fetchPreferences();
    fetchOptions();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('/api/v1/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setPreferences(data[0]);
        } else if (!Array.isArray(data)) {
          setPreferences(data);
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/v1/preferences/options');
      if (response.ok) {
        const data = await response.json();
        setOptions(data);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to save preferences');
        setSaving(false);
        return;
      }
      const method = preferences.id ? 'PUT' : 'POST';
      const response = await fetch('/api/v1/preferences', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferred_topics: preferences.preferred_topics || [],
          blocked_topics: preferences.blocked_topics || [],
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
        alert('Preferences saved successfully!');
      } else if (response.status === 403 || response.status === 401) {
        alert('Please log in to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences');
    } finally {
      setSaving(false);
    }
  };

  const addTopic = (topic: string, isBlocked: boolean = false) => {
    if (!topic.trim()) return;
    
    const field = isBlocked ? 'blocked_topics' : 'preferred_topics';
    const currentTopics = preferences[field] || [];
    
    if (!currentTopics.includes(topic)) {
      setPreferences({
        ...preferences,
        [field]: [...currentTopics, topic]
      });
    }
    
    if (isBlocked) {
      setNewBlockedTopic('');
    } else {
      setNewTopic('');
    }
  };

  const removeTopic = (topic: string, isBlocked: boolean = false) => {
    const field = isBlocked ? 'blocked_topics' : 'preferred_topics';
    const currentTopics = preferences[field] || [];
    
    setPreferences({
      ...preferences,
      [field]: currentTopics.filter(t => t !== topic)
    });
  };

  if (loading) {
    return <div className="p-6">Loading preferences...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Topic Preferences</h1>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Preferred Topics</h2>
        <div className="flex gap-2 mb-2">
          <Input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Add a topic you're interested in"
            onKeyPress={(e) => e.key === 'Enter' && addTopic(newTopic)}
          />
          <Button onClick={() => addTopic(newTopic)}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {preferences.preferred_topics?.map(topic => (
            <Badge key={topic} variant="secondary" className="cursor-pointer" onClick={() => removeTopic(topic)}>
              {topic} ×
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Topics to Avoid</h2>
        <div className="flex gap-2 mb-2">
          <Input
            value={newBlockedTopic}
            onChange={(e) => setNewBlockedTopic(e.target.value)}
            placeholder="Add a topic to avoid"
            onKeyPress={(e) => e.key === 'Enter' && addTopic(newBlockedTopic, true)}
          />
          <Button onClick={() => addTopic(newBlockedTopic, true)} variant="outline">Block</Button>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {preferences.blocked_topics?.map(topic => (
            <Badge key={topic} variant="destructive" className="cursor-pointer" onClick={() => removeTopic(topic, true)}>
              {topic} ×
            </Badge>
          ))}
        </div>
      </Card>

      {/* Suggested Topics */}
      {options?.suggested_topics && options.suggested_topics.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Suggested Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {options.suggested_topics.map(topic => (
              <div
                key={topic.id}
                className={`p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                  preferences.preferred_topics?.includes(topic.topic_name)
                    ? 'bg-primary/10 border-primary'
                    : 'border-gray-200'
                }`}
                onClick={() => addTopic(topic.topic_name)}
              >
                <div className="font-medium text-sm">{topic.topic_name}</div>
                <div className="text-xs text-gray-500">{topic.category}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
