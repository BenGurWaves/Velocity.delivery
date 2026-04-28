'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface InvertedScrollProps {
  children: ReactNode
}

export default function InvertedScroll({ children }: InvertedScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const targetScrollRef = useRef(0)
  const currentScrollRef = useRef(0)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Start at bottom (Hero visible first)
    const startAtBottom = () => {
      const maxScroll = container.scrollHeight - container.clientHeight
      targetScrollRef.current = maxScroll
      currentScrollRef.current = maxScroll
      container.scrollTop = maxScroll
    }
    
    const timer = setTimeout(startAtBottom, 300)

    // Slow scroll physics - luxury weight
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const container = containerRef.current
      if (!container) return

      // 0.4x speed for deliberate, heavy scroll feel
      const delta = e.deltaY * 0.4
      const maxScroll = container.scrollHeight - container.clientHeight
      
      // Inverted: scrolling down moves content up (reveals footer at top)
      targetScrollRef.current = Math.max(0, Math.min(maxScroll, targetScrollRef.current - delta))
    }

    // Smooth interpolation loop - 0.06 lerp for weight
    const animate = () => {
      const container = containerRef.current
      if (!container) return

      const diff = targetScrollRef.current - currentScrollRef.current
      currentScrollRef.current += diff * 0.06

      if (Math.abs(diff) > 0.1) {
        container.scrollTop = currentScrollRef.current
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      clearTimeout(timer)
      container.removeEventListener('wheel', handleWheel)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={{
        display: 'flex',
        flexDirection: 'column-reverse',
      }}
    >
      {children}
    </div>
  )
}
