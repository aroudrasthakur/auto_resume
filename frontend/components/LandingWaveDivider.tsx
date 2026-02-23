'use client'

export default function LandingWaveDivider() {
  return (
    <div className="h-[120px] w-full min-w-0 overflow-hidden">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="w-[200%] h-full animate-[waveFlow_8s_ease-in-out_infinite_alternate]"
        aria-hidden
      >
        <path
          d="M0,60 C180,120 360,0 540,60 C720,120 900,0 1080,60 C1260,120 1380,40 1440,60 L1440,120 L0,120 Z"
          fill="#0d0d0d"
        />
      </svg>
    </div>
  )
}
