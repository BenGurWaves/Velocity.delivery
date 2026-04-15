'use client'

import { motion } from 'framer-motion'
import VWatermark from './VWatermark'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden shrink-0">
      {/* V Watermark behind text - barely visible */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <VWatermark className="w-[350px] h-[350px] md:w-[500px] md:h-[500px] text-atelier-cream/5" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="font-serif text-[56px] sm:text-[80px] md:text-[120px] lg:text-[160px] leading-[0.85] tracking-[-0.02em]"
        >
          <span className="text-atelier-cream">Velocity</span>
          <span className="text-atelier-orange">.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="w-20 h-[1px] bg-atelier-cream/20 my-8"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="text-[10px] sm:text-[11px] font-sans font-light tracking-[0.4em] text-atelier-cream-muted uppercase"
        >
          Digital Ateliers
        </motion.p>
      </div>
    </section>
  )
}
