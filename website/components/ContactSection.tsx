'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export default function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [hovered, setHovered] = useState(false)

  return (
    <section ref={ref} className="relative min-h-[80vh] bg-atelier-black px-6 lg:px-12 py-32 flex items-center shrink-0">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-[11px] font-sans tracking-[0.3em] uppercase text-atelier-cream-muted mb-12">
            Commission
          </p>

          <a 
            href="mailto:atelier@velocity.delivery"
            className="block group"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <h2 className="font-serif text-[36px] sm:text-[48px] md:text-[64px] lg:text-[80px] leading-[1.1] text-atelier-cream group-hover:text-atelier-orange transition-colors duration-700">
              Begin a project
            </h2>
          </a>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-16 pt-8 border-t border-atelier-cream/10 max-w-md"
          >
            <p className="text-[12px] sm:text-[13px] font-sans font-light leading-[1.7] text-atelier-cream-muted">
              We accept four commissions per year. Each project is a six-month minimum engagement. If your maison has outgrown the agency model, we should speak.
            </p>
            <p className="mt-6 text-[13px] font-sans text-atelier-cream">
              atelier@velocity.delivery
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
