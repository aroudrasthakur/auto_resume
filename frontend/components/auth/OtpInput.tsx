'use client'

import { useRef, useCallback, KeyboardEvent, ClipboardEvent } from 'react'

type OtpInputProps = {
  length?: number
  value: string[]
  onChange: (value: string[]) => void
  onComplete?: (code: string) => void
  error?: string
}

export default function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const setDigit = useCallback(
    (index: number, digit: string) => {
      const next = [...value]
      next[index] = digit.replace(/\D/g, '').slice(-1)
      onChange(next)
      if (next.every(Boolean) && next.join('').length === length && onComplete) {
        onComplete(next.join(''))
      }
    },
    [value, onChange, length, onComplete]
  )

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setDigit(index - 1, '')
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const next = pasted.split('').concat(Array(length).fill('')).slice(0, length)
    onChange(next)
    const lastFilled = Math.min(pasted.length, length) - 1
    if (lastFilled >= 0) inputRefs.current[lastFilled]?.focus()
    if (next.every(Boolean) && onComplete) onComplete(next.join(''))
  }

  return (
    <div>
      <div className="flex gap-2 justify-center">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] ?? ''}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="h-12 w-12 rounded-lg border border-b2 bg-b1 text-text text-center text-lg font-mono focus:outline-none focus:border-gold transition-colors"
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red text-center">{error}</p>}
    </div>
  )
}