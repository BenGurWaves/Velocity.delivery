'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PreloaderProps {
  onComplete: () => void
}

const letters = ['V', 'e', 'l', 'o', 'c', 'i', 't', 'y']

export default function Preloader({ onComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [exitStarted, setExitStarted] = useState(false)

  useEffect(() => {
    // Total animation: 3.2s
    // Letters animate 0-2s, hold 0.5s, exit 0.7s
    const exitTimer = setTimeout(() => {
      setExitStarted(true)
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(onComplete, 500)
      }, 700)
    }, 2500)

    return () => clearTimeout(exitTimer)
  }, [onComplete])

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  }

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-atelier-black"
          aria-hidden="true"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={exitStarted ? "exit" : "visible"}
            className="flex items-baseline"
          >
            {letters.map((letter, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="font-serif text-[48px] sm:text-[64px] md:text-[80px] text-atelier-cream inline-block"
                style={{ 
                  willChange: 'transform, opacity',
                }}
              >
                {letter}
              </motion.span>
            ))}
            <motion.span
              variants={letterVariants}
              className="font-serif text-[48px] sm:text-[64px] md:text-[80px] text-atelier-orange inline-block"
            >
              .
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
