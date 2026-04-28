'use client'

interface VWatermarkProps {
  className?: string
}

export default function VWatermark({ className = '' }: VWatermarkProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="currentColor"
      className={`pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <path
        d="M100 20L20 180H50L100 60L150 180H180L100 20Z"
        opacity="0.1"
      />
    </svg>
  )
}
