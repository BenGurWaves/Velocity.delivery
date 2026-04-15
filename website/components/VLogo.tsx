'use client'

interface VLogoProps {
  size?: number
  className?: string
  animate?: boolean
}

export default function VLogo({ size = 24, className = '', animate = false }: VLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animate ? 'animate-spin-slow' : ''}`}
    >
      <path
        d="M12 2L2 22H6L12 8L18 22H22L12 2Z"
        fill="currentColor"
      />
      <path
        d="M12 8L8 16H16L12 8Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  )
}
