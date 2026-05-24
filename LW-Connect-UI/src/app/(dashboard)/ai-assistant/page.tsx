'use client'

import { AIAssistant } from '@/components/features/ai-assistant'
import { AIMessage } from '@/types'

export default function AIAssistantPage() {
  const handleSendMessage = async (message: string): Promise<AIMessage> => {
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I understand you're looking for "${message}". Based on your profile and learning goals, I can help you find the right mentors and courses. Would you like me to show you some recommendations?`,
      timestamp: new Date(),
      recommendations: [
        {
          type: 'mentor',
          id: '1',
          title: 'Dr. Sarah Johnson - Data Science',
          reason: 'Matches your interest in analytics',
        },
        {
          type: 'course',
          id: '1',
          title: 'Introduction to Data Science',
          reason: 'Perfect for beginners',
        },
      ],
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-8 border-b">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">Get personalized recommendations and guidance</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <AIAssistant onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}
