'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { sessionService } from '@/services/api.service'
import { getApiErrorMessage } from '@/lib/user-mapper'

interface FeedbackModalProps {
  bookingId: string
  mentorName: string
  isOpen: boolean
  onClose: () => void
  onSubmitted: () => void
}

export function FeedbackModal({
  bookingId,
  mentorName,
  isOpen,
  onClose,
  onSubmitted,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating < 1) {
      setError('Please select a rating')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await sessionService.submitFeedback(bookingId, rating, comment || undefined)
      setRating(0)
      setComment('')
      onSubmitted()
      onClose()
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to submit feedback'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError('')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Feedback for ${mentorName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">How was your session?</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="p-1 rounded hover:bg-accent transition-colors"
                aria-label={`Rate ${value} stars`}
              >
                <Star
                  className={`h-7 w-7 ${
                    value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="feedback-comment" className="text-sm font-medium">
            Comments (optional)
          </label>
          <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
