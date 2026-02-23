'use client'

import { useEffect, useRef, useState } from 'react'

const waves = [
  { yPct: 0.25, amp: 28, freq: 0.003, speed: 0.6, alpha: 0.04, lineW: 1 },
  { yPct: 0.35, amp: 18, freq: 0.004, speed: 0.8, alpha: 0.025, lineW: 0.8 },
  { yPct: 0.55, amp: 32, freq: 0.0025, speed: 0.5, alpha: 0.035, lineW: 1 },
  { yPct: 0.65, amp: 20, freq: 0.0035, speed: 0.9, alpha: 0.02, lineW: 0.7 },
  { yPct: 0.8, amp: 24, freq: 0.003, speed: 0.7, alpha: 0.03, lineW: 0.9 },
]

export default function WaveCanvas() {
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight

    const setSize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    setSize()
    window.addEventListener('resize', setSize)

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      tRef.current += 0.008
      const t = tRef.current

      waves.forEach((wave) => {
        ctx.beginPath()
        for (let x = 0; x <= W; x += 2) {
          const y =
            wave.yPct * H +
            Math.sin(x * wave.freq + t * wave.speed) * wave.amp +
            Math.sin(x * wave.freq * 0.5 + t * wave.speed * 1.3 + 1) * (wave.amp * 0.4)
          ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(201,169,110,${wave.alpha})`
        ctx.lineWidth = wave.lineW
        ctx.stroke()
      })

      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', setSize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.5 }}
      aria-hidden
    />
  )
}
