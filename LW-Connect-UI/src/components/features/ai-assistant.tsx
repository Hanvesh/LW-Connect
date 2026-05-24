'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Sparkles } from 'lucide-react'
import { AIMessage } from '@/types'
import { MentorCard } from './mentor-card'
import { CourseCard } from './course-card'

const suggestedPrompts = [
  'Find me a mentor for data science',
  'Recommend courses for beginners',
  'Show mentors available this week',
  'Help me with career guidance',
]

interface AIAssistantProps {
  onSendMessage: (message: string) => Promise<AIMessage>
}

export function AIAssistant({ onSendMessage }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (message: string) => {
    if (!message.trim()) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await onSendMessage(message)
      setMessages((prev) => [...prev, response])
    } catch (error) {
      console.error('AI error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
            <p className="text-muted-foreground mb-6">
              Ask me anything about mentors, courses, or career guidance
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="p-3 text-sm text-left border rounded-lg hover:bg-accent transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card
              className={`max-w-[80%] ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              <div className="p-4">
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.recommendations && message.recommendations.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {message.recommendations.map((rec) => (
                      <div key={rec.id} className="p-3 bg-accent rounded-lg">
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-4">
              <div className="flex gap-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-100" />
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-200" />
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask me anything..."
            disabled={isLoading}
          />
          <Button onClick={() => handleSend(input)} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
