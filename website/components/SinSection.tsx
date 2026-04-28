'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function SinSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const sins = [
    "Theft of provenance through stock imagery",
    "Algorithmic desperation masquerading as strategy",
    "Velocity without craft — the cardinal sin"
  ]

  return (
    <section ref={ref} className="relative min-h-screen bg-atelier-black px-6 py-40">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Left content */}
          <div className="lg:col-span-7">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="font-serif text-[36px] sm:text-[48px] md:text-[64px] leading-[1.1] text-atelier-cream mb-12"
            >
              Most heritage sites are theater.
            </motion.h2>

            <div className="space-y-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                className="text-[15px] sm:text-[16px] font-sans font-light leading-[1.7] text-atelier-cream-muted max-w-[500px]"
              >
                Your atelier spends forty hours on a single stitch. Your website was built in a weekend by someone who has never held a loupe.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="text-[15px] sm:text-[16px] font-sans font-light leading-[1.7] text-atelier-cream-muted max-w-[500px]"
              >
                The gap between physical craft and digital reality is not a technical problem. It is a truth problem. Most agencies lie about what heritage requires.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="text-[15px] sm:text-[16px] font-sans font-light leading-[1.7] text-atelier-cream-muted max-w-[500px]"
              >
                We are the John the Baptist of luxury digital: we tell the brutal truth, then quietly fix it for those who can bear it.
              </motion.p>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-12 px-6 py-3 border border-atelier-cream-muted text-[11px] font-sans tracking-[0.2em] uppercase text-atelier-cream hover:bg-atelier-cream hover:text-atelier-black transition-all duration-300"
            >
              Read the Full Dissection
            </motion.button>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-5 lg:border-l lg:border-atelier-cream-muted/20 lg:pl-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <h3 className="text-[11px] font-sans tracking-[0.25em] uppercase text-atelier-cream mb-8">
                The Three Sins
              </h3>

              <ul className="space-y-4">
                {sins.map((sin, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1, ease: [0.23, 1, 0.32, 1] }}
                    className="flex items-start gap-4 text-[13px] font-sans font-light text-atelier-cream-muted"
                  >
                    <span className="text-atelier-cream font-serif">{String(index + 1).padStart(2, '0')}</span>
                    {sin}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
