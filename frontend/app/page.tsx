'use client'

import WaveCanvas from '@/components/WaveCanvas'
import Cursor from '@/components/Cursor'
import LandingNav from '@/components/LandingNav'
import Hero from '@/components/Hero'
import LandingWaveDivider from '@/components/LandingWaveDivider'
import TickerStrip from '@/components/TickerStrip'
import StatsStrip from '@/components/StatsStrip'
import Features from '@/components/Features'
import Process from '@/components/Process'
import LandingCTA from '@/components/LandingCTA'
import LandingFooter from '@/components/LandingFooter'

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen min-w-0 overflow-x-hidden bg-bg text-text">
      <WaveCanvas />
      <Cursor />
      <LandingNav />
      <main id="main-content" className="min-w-0 overflow-x-hidden">
        <Hero />
        <LandingWaveDivider />
        <TickerStrip />
        <StatsStrip />
        <section id="features" aria-label="Features">
          <Features />
        </section>
        <Process />
        <LandingCTA />
        <LandingFooter />
      </main>
    </div>
  )
}
