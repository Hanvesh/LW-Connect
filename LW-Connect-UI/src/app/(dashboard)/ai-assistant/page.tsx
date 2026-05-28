'use client'

import { useState } from 'react'
import { AIAssistant } from '@/components/features/ai-assistant'
import { AIMessage, Recommendation } from '@/types'
import { aiService } from '@/services/api.service'
import { useAuthStore } from '@/store/auth.store'

function mapSourcesToRecommendations(
  sources: Array<{ content: string; doc_type: string }>
): Recommendation[] {
  return sources.slice(0, 3).map((source, index) => {
    const type = source.doc_type === 'course' ? 'course' : 'mentor'
    const title = source.content.split('\n')[0].slice(0, 80) || `${type} recommendation`
    return {
      type,
      id: String(index + 1),
      title,
      reason: `Relevant ${source.doc_type.replace('_', ' ')} from knowledge base`,
    }
  })
}

export default function AIAssistantPage() {
  const user = useAuthStore((state) => state.user)
  const [sessionId, setSessionId] = useState<string>()

  const handleSendMessage = async (message: string): Promise<AIMessage> => {
    const data = await aiService.chat(message, user?.id || 'anonymous', sessionId)
    const nextSessionId = data.session_id ?? (data as any).sessionId

    if (nextSessionId) {
      setSessionId(nextSessionId)
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: data.response,
      timestamp: new Date(),
      recommendations: mapSourcesToRecommendations(data.sources),
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
