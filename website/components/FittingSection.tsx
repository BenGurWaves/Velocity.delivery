'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const redactedHeadlines = [
  { title: 'Why [REDACTED] fired their agency after seeing their own provenance story', date: 'Issue 12' },
  { title: 'The 47% perceived value increase: a case study in digital restraint', date: 'Issue 11' },
  { title: '[REDACTED] Parfumerie: from catalog to ceremony in 90 days', date: 'Issue 10' },
]

export default function FittingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [showForm, setShowForm] = useState(false)
  const [formState, setFormState] = useState({ name: '', maison: '', email: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setShowForm(false)
      setSubmitted(false)
      setFormState({ name: '', maison: '', email: '' })
    }, 2000)
  }

  return (
    <section ref={ref} className="relative min-h-screen bg-atelier-black px-6 py-40">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-[800px]"
        >
          <h2 className="font-serif text-[36px] sm:text-[48px] md:text-[64px] leading-[1.1] text-atelier-cream mb-6">
            The Quarterly Dissection
          </h2>
          <p className="text-[15px] sm:text-[16px] font-sans font-light leading-[1.7] text-atelier-cream-muted mb-12 max-w-[500px]">
            Private, unsigned, brutal. For principals only. Three redacted case studies delivered to your inbox each quarter.
          </p>
        </motion.div>

        {/* Redacted headlines as cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {redactedHeadlines.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="p-5 border border-atelier-cream-muted/10 hover:border-atelier-cream/20 transition-all duration-300"
            >
              <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-atelier-cream-muted block mb-3">
                {item.date}
              </span>
              <p className="text-[13px] font-sans font-light leading-[1.6] text-atelier-cream">
                {item.title}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="px-8 py-4 border border-atelier-cream text-[11px] font-sans tracking-[0.2em] uppercase text-atelier-cream hover:bg-atelier-cream hover:text-atelier-black transition-all duration-300"
        >
          Request the Next Fitting
        </motion.button>

        {/* Modal Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-atelier-black/95 p-6"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-md bg-atelier-dark p-8 border border-atelier-cream-muted/20"
                onClick={(e) => e.stopPropagation()}
              >
                {submitted ? (
                  <div className="text-center py-8">
                    <p className="font-serif text-[24px] text-atelier-cream mb-4">Received.</p>
                    <p className="text-[13px] font-sans font-light text-atelier-cream-muted">
                      If selected, you will hear from us within 48 hours.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-serif text-[20px] text-atelier-cream mb-6">Request Access</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-sans tracking-[0.2em] uppercase text-atelier-cream-muted block mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full bg-transparent border-b border-atelier-cream-muted/30 py-2 text-[14px] font-sans text-atelier-cream focus:border-atelier-cream outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-sans tracking-[0.2em] uppercase text-atelier-cream-muted block mb-2">
                          Maison
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.maison}
                          onChange={(e) => setFormState({ ...formState, maison: e.target.value })}
                          className="w-full bg-transparent border-b border-atelier-cream-muted/30 py-2 text-[14px] font-sans text-atelier-cream focus:border-atelier-cream outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-sans tracking-[0.2em] uppercase text-atelier-cream-muted block mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full bg-transparent border-b border-atelier-cream-muted/30 py-2 text-[14px] font-sans text-atelier-cream focus:border-atelier-cream outline-none transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full mt-6 py-3 border border-atelier-cream text-[11px] font-sans tracking-[0.2em] uppercase text-atelier-cream hover:bg-atelier-cream hover:text-atelier-black transition-all duration-300"
                      >
                        Submit Request
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
