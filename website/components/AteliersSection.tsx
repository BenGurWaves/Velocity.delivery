'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const ateliers = [
  {
    result: 'Increased perceived value 47% without changing a single physical piece.',
    category: 'Heritage Watchmaking'
  },
  {
    result: 'Reduced inquiry-to-appointment time from 14 days to 48 hours.',
    category: 'Bespoke Tailoring'
  },
  {
    result: 'Digital ceremony that matches the unboxing of a 200-year-old maison.',
    category: 'Parfumerie'
  },
  {
    result: 'Zero stock imagery. 100% documented provenance. 3x engagement.',
    category: 'Artisan Jewelry'
  },
  {
    result: 'The website now costs more than a car. It generates more than a house.',
    category: 'Private Leather Goods'
  }
]

export default function AteliersSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative min-h-screen bg-atelier-dark px-6 py-40 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-16"
        >
          <h2 className="font-serif text-[11px] tracking-[0.25em] uppercase text-atelier-cream-muted mb-4">
            Selected Ateliers
          </h2>
          <p className="font-serif text-[28px] sm:text-[36px] leading-[1.3] text-atelier-cream">
            Anonymous case studies
          </p>
        </motion.div>
      </div>

      {/* Horizontal scroll container */}
      <div className="overflow-x-auto pb-8 scrollbar-hide">
        <div className="flex gap-6 px-6 max-w-7xl mx-auto" style={{ width: 'max-content' }}>
          {ateliers.map((atelier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="group relative w-[320px] sm:w-[400px] flex-shrink-0"
            >
              {/* Before/After placeholder animation */}
              <div className="relative h-[200px] bg-atelier-black border border-atelier-cream-muted/10 overflow-hidden mb-4">
                <motion.div
                  className="absolute inset-0 bg-atelier-cream-muted/5"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-atelier-cream-muted group-hover:text-atelier-cream transition-colors">
                    [ Transformation ]
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-atelier-cream-muted block mb-2">
                {atelier.category}
              </span>
              <p className="text-[14px] font-sans font-light leading-[1.6] text-atelier-cream">
                {atelier.result}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="max-w-7xl mx-auto mt-8">
        <p className="text-[10px] font-sans tracking-[0.15em] uppercase text-atelier-cream-muted/50">
          Scroll to explore
        </p>
      </div>
    </section>
  )
}
