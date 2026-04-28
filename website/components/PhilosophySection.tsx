'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function PhilosophySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative min-h-screen bg-atelier-black px-6 lg:px-12 py-32 flex items-center shrink-0">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-[11px] font-sans tracking-[0.3em] uppercase text-atelier-cream-muted mb-16">
            Philosophy
          </p>
          
          <h2 className="font-serif text-[32px] sm:text-[42px] md:text-[56px] lg:text-[72px] leading-[1.15] text-atelier-cream max-w-4xl">
            Most heritage sites are theater. We build ateliers.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24"
        >
          <p className="text-[14px] sm:text-[15px] font-sans font-light leading-[1.8] text-atelier-cream-muted">
            Your atelier spends forty hours on a single stitch. Your website was built in a weekend by someone who has never held a loupe. The gap between physical craft and digital reality is not a technical problem. It is a truth problem.
          </p>
          <p className="text-[14px] sm:text-[15px] font-sans font-light leading-[1.8] text-atelier-cream-muted">
            We are the John the Baptist of luxury digital: we tell the brutal truth about why most "high-end" websites leak provenance, then quietly fix it for those who can bear it. Four commissions per year. No exceptions.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
