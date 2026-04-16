'use client'

import { useState } from 'react'
import Preloader from '@/components/Preloader'
import CustomCursor from '@/components/CustomCursor'
import InvertedScroll from '@/components/InvertedScroll'
import HeroSection from '@/components/HeroSection'
import PhilosophySection from '@/components/PhilosophySection'
import ServicesSection from '@/components/ServicesSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <>
      <Preloader onComplete={() => setIsLoaded(true)} />
      
      {isLoaded && (
        <>
          <CustomCursor />
          <InvertedScroll>
            <HeroSection />
            <PhilosophySection />
            <ServicesSection />
            <ContactSection />
            <Footer />
          </InvertedScroll>
        </>
      )}
    </>
  )
}
