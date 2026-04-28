'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const notes = [
  {
    excerpt: 'On the heresy of "brand storytelling" when you have actual history to document.',
    date: 'March 2026'
  },
  {
    excerpt: 'Why your product photography is lying about your craft, and how to fix it without a bigger budget.',
    date: 'February 2026'
  },
  {
    excerpt: 'The 200-millisecond rule: luxury websites that feel slow actually convert better. Here is why.',
    date: 'January 2026'
  }
]

export default function NotesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative min-h-[60vh] bg-atelier-black px-6 py-40">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-16"
        >
          <h2 className="font-serif text-[11px] tracking-[0.25em] uppercase text-atelier-cream-muted mb-4">
            Atelier Notes
          </h2>
          <p className="font-serif text-[28px] sm:text-[36px] leading-[1.3] text-atelier-cream">
            Recent journal entries
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {notes.map((note, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="group cursor-pointer"
            >
              <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-atelier-cream-muted block mb-4">
                {note.date}
              </span>
              <p className="text-[15px] font-sans font-light leading-[1.7] text-atelier-cream group-hover:text-atelier-cream-muted transition-colors duration-300">
                {note.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-sans tracking-[0.15em] uppercase text-atelier-cream-muted group-hover:text-atelier-cream transition-colors duration-300">
                <span>Read note</span>
                <motion.svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="group-hover:translate-x-1 transition-transform duration-300"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </motion.svg>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="mt-16 pt-8 border-t border-atelier-cream-muted/10"
        >
          <p className="text-[13px] font-sans font-light text-atelier-cream-muted">
            Full private archive available to commissioned ateliers.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
