'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MaterialIcon } from '@/components/ui/material-icon'
import { AIMessage } from '@/types'
import { useAuthStore } from '@/store/auth.store'

const suggestedPrompts = [
  { icon: 'person_search', title: 'Find Mentors', desc: 'Suggest mentors for data policy' },
  { icon: 'trending_up', title: 'Track Growth', desc: 'Show my learning progress' },
  { icon: 'lightbulb', title: 'Next Course', desc: 'Draft a study plan for Q4' },
  { icon: 'forum', title: 'Peer Connect', desc: "Who's active in Policy Innovation?" },
]

interface AIAssistantProps {
  onSendMessage: (message: string) => Promise<AIMessage>
}

export function AIAssistant({ onSendMessage }: AIAssistantProps) {
  const user = useAuthStore((state) => state.user)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setIsLoading(true)

    try {
      const response = await onSendMessage(message)
      setMessages((prev) => [...prev, response])
    } catch (error) {
      console.error('AI error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content:
            'Sorry, I could not reach the AI service. Make sure the LangChain service is running on port 8001.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextareaInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Inline header for full-bleed AI workspace */}
      <header className="bg-surface border-b border-outline-variant flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-lg flex-1">
          <div className="relative w-full max-w-xl hidden md:block">
            <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-12 pr-4 text-body-md focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all"
              placeholder="Search in workspace..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-lg">
          <button className="text-on-surface-variant hover:text-primary transition-opacity relative" aria-label="Notifications">
            <MaterialIcon name="notifications" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full" />
          </button>
          <MaterialIcon name="auto_awesome" filled className="text-secondary" />
          <div className="h-8 w-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <MaterialIcon name="account_circle" />
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto chat-container px-margin-mobile md:px-margin-desktop py-xl max-w-4xl mx-auto w-full space-y-xl pb-40">
        {messages.length === 0 && (
          <div className="flex gap-lg">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center flex-shrink-0 shadow-md">
              <MaterialIcon name="auto_awesome" filled className="text-on-secondary-container" />
            </div>
            <div className="space-y-lg flex-1">
              <p className="text-body-lg text-on-surface leading-relaxed">
                Welcome back to your Innovation Workspace{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
                How would you like to proceed today?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-sm">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt.title}
                    onClick={() => handleSend(prompt.desc)}
                    className="flex items-center gap-md p-md bg-surface-container-lowest border border-outline-variant rounded-xl text-left hover:bg-surface-container transition-all hover:shadow-md hover:-translate-y-1"
                  >
                    <MaterialIcon name={prompt.icon} className="text-secondary" />
                    <div>
                      <p className="text-label-md font-bold">{prompt.title}</p>
                      <p className="text-xs text-on-surface-variant">{prompt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.id} className="flex flex-row-reverse gap-lg">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0 shadow-sm">
                <MaterialIcon name="person" className="text-on-secondary-container" />
              </div>
              <div className="bg-primary-container text-on-primary py-md px-lg rounded-2xl rounded-tr-none shadow-md max-w-lg">
                <p className="text-body-md whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex gap-lg">
              <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center flex-shrink-0 shadow-md">
                <MaterialIcon name="auto_awesome" filled className="text-on-secondary-container" />
              </div>
              <div className="space-y-lg flex-1">
                <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">{message.content}</p>
                {message.recommendations && message.recommendations.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                    {message.recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg shadow-sm hover:shadow-lg transition-all border-l-4 border-secondary"
                      >
                        <p className="text-title-lg text-on-surface mb-sm">{rec.title}</p>
                        <p className="text-label-md text-on-surface-variant mb-lg">{rec.reason}</p>
                        <Link href={rec.type === 'course' ? '/courses' : '/mentors'} className="text-secondary font-bold text-label-md hover:underline flex items-center gap-xs">
                          View {rec.type === 'course' ? 'Course' : 'Mentor'}
                          <MaterialIcon name="arrow_forward" className="text-[18px]" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {isLoading && (
          <div className="flex gap-lg">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center flex-shrink-0 shadow-md">
              <MaterialIcon name="auto_awesome" filled className="text-on-secondary-container animate-pulse" />
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg">
              <div className="flex gap-2">
                <div className="h-2 w-2 bg-secondary rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-secondary rounded-full animate-bounce [animation-delay:100ms]" />
                <div className="h-2 w-2 bg-secondary rounded-full animate-bounce [animation-delay:200ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating input */}
      <div className="absolute bottom-0 left-0 w-full pb-8 pt-4 px-margin-mobile md:px-margin-desktop bg-gradient-to-t from-surface via-surface to-transparent">
        <div className="max-w-4xl mx-auto glass-effect border border-outline-variant rounded-[24px] shadow-2xl p-2 relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-lg">
            <span className="bg-surface-container-high px-4 py-1.5 rounded-full text-label-sm font-bold flex items-center gap-sm text-secondary animate-pulse">
              <MaterialIcon name="auto_awesome" filled className="text-[16px]" />
              AI Assistant Online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors" aria-label="Attach">
              <MaterialIcon name="add_circle" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={handleTextareaInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(input)
                }
              }}
              className="flex-1 bg-transparent border-none focus:ring-0 text-body-md py-3 resize-none max-h-32 min-h-[24px] leading-relaxed outline-none"
              placeholder="Type your message to LW-Assistant..."
              rows={1}
              disabled={isLoading}
            />
            <div className="flex items-center gap-2 pr-2">
              <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors" aria-label="Voice input">
                <MaterialIcon name="mic" />
              </button>
              <button
                onClick={() => handleSend(input)}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-lg hover:bg-secondary/90 transition-all active:scale-95 disabled:opacity-50"
                aria-label="Send message"
              >
                <MaterialIcon name="send" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
