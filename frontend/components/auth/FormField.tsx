'use client'

import { InputHTMLAttributes, useState, ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  type?: string
  error?: string
  containerClassName?: string
  labelRight?: ReactNode
}

export default function FormField({
  id,
  label,
  type: initialType = 'text',
  error,
  containerClassName = '',
  className = '',
  labelRight,
  ...inputProps
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = initialType === 'password'
  const type = isPassword && showPassword ? 'text' : initialType

  return (
    <div className={`field ${containerClassName}`}>
      <label htmlFor={id} className="field-label">
        <span>{label}</span>
        {labelRight != null ? <span className="flex items-center">{labelRight}</span> : null}
      </label>
      <div className="field-input-wrap relative">
        <input
          id={id}
          type={type}
          className={`field-input ${isPassword ? 'pr-[44px]' : ''} ${className}`}
          {...inputProps}
        />
        <span className="focus-line" aria-hidden />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-[14px] top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red">{error}</p>}
    </div>
  )
}
