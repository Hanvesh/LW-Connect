'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MaterialIcon } from '@/components/ui/material-icon';

interface PreferenceOptions {
  suggested_topics: Array<{
    id: string;
    category: string;
    topic_name: string;
    description: string;
  }>;
}

interface UserPreferences {
  preferred_topics?: string[];
  blocked_topics?: string[];
}

interface PreferencesOnboardingProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip: () => void;
}

export default function PreferencesOnboarding({ onComplete, onSkip }: PreferencesOnboardingProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferred_topics: [],
    blocked_topics: [],
  });
  const [options, setOptions] = useState<PreferenceOptions | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [blockedTopics, setBlockedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [blockedTopic, setBlockedTopic] = useState('');

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/v1/preferences/options');
      if (response.ok) {
        const data = await response.json();
        setOptions(data);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const addTopic = (topic: string) => {
    if (topic && !selectedTopics.includes(topic)) {
      const newTopics = [...selectedTopics, topic];
      setSelectedTopics(newTopics);
      setPreferences({ ...preferences, preferred_topics: newTopics });
    }
    setCustomTopic('');
  };

  const removeTopic = (topic: string) => {
    const newTopics = selectedTopics.filter(t => t !== topic);
    setSelectedTopics(newTopics);
    setPreferences({ ...preferences, preferred_topics: newTopics });
  };

  const addBlockedTopic = (topic: string) => {
    if (topic && !blockedTopics.includes(topic)) {
      const newTopics = [...blockedTopics, topic];
      setBlockedTopics(newTopics);
      setPreferences({ ...preferences, blocked_topics: newTopics });
    }
    setBlockedTopic('');
  };

  const removeBlockedTopic = (topic: string) => {
    const newTopics = blockedTopics.filter(t => t !== topic);
    setBlockedTopics(newTopics);
    setPreferences({ ...preferences, blocked_topics: newTopics });
  };

  const topicsByCategory = options?.suggested_topics.reduce((acc, topic) => {
    if (!acc[topic.category]) acc[topic.category] = [];
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, typeof options.suggested_topics>) || {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <Card className="w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-end mb-4">
            <button onClick={onSkip} className="text-sm text-gray-500 hover:text-gray-700">
              Skip setup
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Topics of Interest</h2>
            <p className="text-gray-600">What would you like to learn about?</p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Add preferred topics */}
            <div>
              <label className="block text-sm font-medium mb-2">Add Topic</label>
              <div className="flex gap-2">
                <Input
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Enter a topic you're interested in"
                  onKeyPress={(e) => e.key === 'Enter' && addTopic(customTopic)}
                />
                <Button onClick={() => addTopic(customTopic)} type="button">Add</Button>
              </div>
            </div>

            {/* Selected topics */}
            <div>
              <label className="block text-sm font-medium mb-2">Selected Topics</label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-lg bg-gray-50">
                {selectedTopics.length === 0 ? (
                  <span className="text-gray-500 text-sm">No topics selected yet</span>
                ) : (
                  selectedTopics.map(topic => (
                    <Badge key={topic} variant="secondary" className="cursor-pointer" onClick={() => removeTopic(topic)}>
                      {topic} ×
                    </Badge>
                  ))
                )}
              </div>
            </div>

            {/* Suggested topics */}
            <div>
              <label className="block text-sm font-medium mb-2">Suggested Topics</label>
              {Object.entries(topicsByCategory).map(([category, topics]) => (
                <div key={category} className="mb-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {topics.slice(0, 6).map(topic => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => addTopic(topic.topic_name)}
                        className={`p-2 text-left border rounded-lg text-sm hover:border-primary transition-colors ${
                          selectedTopics.includes(topic.topic_name)
                            ? 'bg-primary/10 border-primary'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="font-medium">{topic.topic_name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Blocked topics */}
            <div>
              <label className="block text-sm font-medium mb-2">Topics to Avoid</label>
              <div className="flex gap-2">
                <Input
                  value={blockedTopic}
                  onChange={(e) => setBlockedTopic(e.target.value)}
                  placeholder="Enter a topic you want to avoid"
                  onKeyPress={(e) => e.key === 'Enter' && addBlockedTopic(blockedTopic)}
                />
                <Button onClick={() => addBlockedTopic(blockedTopic)} type="button" variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-lg bg-gray-50 mt-2">
                {blockedTopics.length === 0 ? (
                  <span className="text-gray-500 text-sm">No blocked topics</span>
                ) : (
                  blockedTopics.map(topic => (
                    <Badge key={topic} variant="destructive" className="cursor-pointer" onClick={() => removeBlockedTopic(topic)}>
                      {topic} ×
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onComplete(preferences)}>
              Complete Setup
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
