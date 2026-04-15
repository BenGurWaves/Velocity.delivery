'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const rituals = [
  {
    title: 'Provenance',
    description: 'Every pixel carries lineage. We document the craft story that your customers cannot see but must feel.'
  },
  {
    title: 'Rhythm',
    description: 'Motion that breathes like hand-worked leather. Animations measured in centuries, not milliseconds.'
  },
  {
    title: 'Silence',
    description: 'The negative space between interactions. What we remove matters more than what we add.'
  },
  {
    title: 'Scarcity',
    description: 'Digital experiences that feel limited by nature. No infinite scroll. No algorithmic desperation.'
  }
]

export default function RitualSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative min-h-screen bg-atelier-dark px-6 py-40">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-16"
        >
          <h2 className="font-serif text-[11px] tracking-[0.25em] uppercase text-atelier-cream-muted mb-4">
            The Ritual
          </h2>
          <p className="font-serif text-[28px] sm:text-[36px] leading-[1.3] text-atelier-cream max-w-[600px]">
            What we actually do
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rituals.map((ritual, index) => (
            <motion.div
              key={ritual.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ y: -4 }}
              className="group relative p-6 border border-atelier-cream-muted/10 hover:border-atelier-cream/30 transition-all duration-300 cursor-pointer"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-atelier-cream">
                  <path d="M12 2L2 22H6L12 8L18 22H22L12 2Z" />
                </svg>
              </motion.div>

              <h3 className="font-serif text-[24px] text-atelier-cream mb-4">
                {ritual.title}
              </h3>
              <p className="text-[13px] font-sans font-light leading-[1.7] text-atelier-cream-muted">
                {ritual.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="mt-16 text-center text-[13px] font-sans font-light tracking-[0.1em] text-atelier-cream-muted"
        >
          Four commissions per quarter. <span className="text-atelier-cream">No exceptions.</span>
        </motion.p>
      </div>
    </section>
  )
}
