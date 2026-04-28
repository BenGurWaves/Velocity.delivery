'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="relative bg-atelier-black px-6 lg:px-12 py-24 shrink-0">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12"
        >
          <div>
            <p className="font-serif text-[24px] text-atelier-cream">Velocity.</p>
            <p className="mt-2 text-[11px] font-sans tracking-[0.2em] uppercase text-atelier-cream-muted">
              Digital Ateliers
            </p>
          </div>

          <a
            href="mailto:atelier@velocity.delivery"
            className="text-[13px] font-sans font-light text-atelier-cream-muted hover:text-atelier-cream transition-colors duration-500"
          >
            atelier@velocity.delivery
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="mt-16 pt-8 border-t border-atelier-cream/10 flex justify-between items-center"
        >
          <p className="text-[10px] font-sans tracking-[0.15em] text-atelier-cream-muted">
            Four commissions per year
          </p>
          <p className="text-[10px] font-sans tracking-[0.15em] text-atelier-cream-muted">
            2026
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
