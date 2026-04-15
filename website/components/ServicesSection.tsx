'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const services = [
  {
    title: 'Provenance',
    description: 'Documenting the craft story that customers cannot see but must feel.'
  },
  {
    title: 'Rhythm',
    description: 'Motion measured in centuries, not milliseconds.'
  },
  {
    title: 'Silence',
    description: 'What we remove matters more than what we add.'
  },
  {
    title: 'Scarcity',
    description: 'Digital experiences that feel limited by nature.'
  }
]

export default function ServicesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative min-h-screen bg-atelier-dark px-6 lg:px-12 py-32 flex items-center shrink-0">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-24"
        >
          <p className="text-[11px] font-sans tracking-[0.3em] uppercase text-atelier-cream-muted mb-6">
            The Ritual
          </p>
          <p className="font-serif text-[24px] sm:text-[32px] text-atelier-cream">
            What we actually do
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-atelier-cream/10">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-atelier-dark p-8 sm:p-12 group cursor-pointer"
            >
              <div className="flex items-baseline justify-between mb-6">
                <h3 className="font-serif text-[28px] sm:text-[36px] text-atelier-cream group-hover:text-atelier-orange transition-colors duration-500">
                  {service.title}
                </h3>
                <span className="text-[11px] font-sans text-atelier-cream-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <p className="text-[13px] sm:text-[14px] font-sans font-light leading-[1.7] text-atelier-cream-muted">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
