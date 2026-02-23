'use client'

import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    let mx = 0
    let my = 0
    let rx = 0
    let ry = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
    }

    const onOver = (e: MouseEvent) => {
      const target = (e.target as Element).closest('a, button')
      setHover(!!target)
    }
    const onOut = (e: MouseEvent) => {
      const related = (e.relatedTarget as Element)?.closest('a, button')
      if (!related) setHover(false)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
      document.body.classList.add('landing-cursor-active')
    }

    const tick = () => {
      const dot = dotRef.current
      const ring = ringRef.current
      if (dot) {
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
      }
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      if (ring) {
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`
      }
      requestAnimationFrame(tick)
    }
    const id = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.body.classList.remove('landing-cursor-active')
      cancelAnimationFrame(id)
    }
  }, [])

  return (
    <div className="landing-cursor-wrap fixed inset-0 pointer-events-none z-[9999]" aria-hidden>
      <div
        ref={dotRef}
        className="absolute left-0 top-0 w-2 h-2 rounded-full bg-gold pointer-events-none mix-blend-difference z-[9999] transition-[width,height] duration-200 ease-out"
        style={{
          transform: 'translate(-50%, -50%)',
          ...(hover ? { width: 16, height: 16 } : {}),
        }}
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 rounded-full border pointer-events-none z-[9998] transition-[width,height] duration-300 ease-out"
        style={{
          width: hover ? 56 : 36,
          height: hover ? 56 : 36,
          borderColor: 'rgba(201,169,110,0.4)',
        }}
      />
    </div>
  )
}
