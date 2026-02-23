'use client'

import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ mx: 0, my: 0, rx: 0, ry: 0 })
  const visible = useRef(false)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const onMove = (e: MouseEvent) => {
      pos.current.mx = e.clientX
      pos.current.my = e.clientY
      if (!visible.current) {
        dot.classList.add('visible')
        ring.classList.add('visible')
        visible.current = true
      }
    }

    window.addEventListener('mousemove', onMove)

    if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
      document.body.classList.add('landing-cursor-active')
    }

    let raf: number
    const animate = () => {
      const { mx, my, rx, ry } = pos.current
      dot.style.left = mx + 'px'
      dot.style.top = my + 'px'
      pos.current.rx = rx + (mx - rx) * 0.12
      pos.current.ry = ry + (my - ry) * 0.12
      ring.style.left = pos.current.rx + 'px'
      ring.style.top = pos.current.ry + 'px'
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.body.classList.remove('landing-cursor-active')
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="landing-cursor-wrap fixed inset-0 pointer-events-none z-[9999]" aria-hidden>
      <div
        ref={dotRef}
        className="cursor-dot absolute w-2 h-2 rounded-full pointer-events-none z-[9999]"
        style={{
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)',
          background: '#c9a96e',
        }}
      />
      <div
        ref={ringRef}
        className="cursor-ring absolute w-8 h-8 rounded-full border pointer-events-none z-[9998]"
        style={{
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)',
          borderWidth: '1px',
        }}
      />
    </div>
  )
}
