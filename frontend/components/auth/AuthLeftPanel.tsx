'use client'

import { ReactNode } from 'react'

type AuthLeftPanelProps = {
  children: ReactNode
  className?: string
  panelClassName?: string
}

export default function AuthLeftPanel({ children, className = '', panelClassName = '' }: AuthLeftPanelProps) {
  return (
    <div className={`auth-left-panel-wrap ${className}`}>
      <div className={`auth-left-panel min-h-0 flex-1 overflow-hidden ${panelClassName}`.trim()}>
        {children}
      </div>
    </div>
  )
}
