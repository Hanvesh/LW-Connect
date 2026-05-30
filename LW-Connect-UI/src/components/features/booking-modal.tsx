'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Calendar, Clock } from 'lucide-react'
import { Mentor } from '@/types'
import { format, addDays } from 'date-fns'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  mentor: Mentor | null
  onConfirm: (date: string, time: string) => void | Promise<void>
}

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
]

export function BookingModal({ isOpen, onClose, mentor, onConfirm }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i + 1)
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE, MMM d'),
    }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (selectedDate && selectedTime) {
      setIsSubmitting(true)
      try {
        await onConfirm(selectedDate, selectedTime)
        setSelectedDate('')
        setSelectedTime('')
        onClose()
      } catch {
        // error handled by parent
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (!mentor) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book a Session" size="lg">
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Mentor</h3>
          <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-semibold text-primary">{mentor.name.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium">{mentor.name}</p>
              <p className="text-sm text-muted-foreground">{mentor.title}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Select Date
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {dates.map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`p-3 rounded-lg border text-sm transition-colors ${
                  selectedDate === date.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-accent'
                }`}
              >
                {date.label}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Select Time
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    selectedTime === time
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
