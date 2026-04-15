'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function ManifestoSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative min-h-screen bg-atelier-black px-6 lg:px-12 py-32 flex items-center">
      <div className="max-w-4xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="font-serif text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] leading-[1.3] text-atelier-cream"
        >
          We build digital ateliers for heritage maisons who have outgrown the agency model.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="mt-16 pt-8 border-t border-atelier-cream/10"
        >
          <p className="text-[12px] font-sans tracking-[0.2em] uppercase text-atelier-cream-muted">
            Four commissions per year. No exceptions.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
