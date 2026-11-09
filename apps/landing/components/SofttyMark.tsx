import React from 'react'

interface SofttyMarkProps {
  size?: number
  className?: string
}

export function SofttyMark({ size = 36, className = '' }: SofttyMarkProps) {
  const uniqueId = React.useId().replace(/:/g, '_')
  const bgId = `softty_bg_${uniqueId}`
  const shineId = `softty_shine_${uniqueId}`
  const starId = `softty_star_${uniqueId}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Softty Office Logo"
    >
      <defs>
        <linearGradient id={bgId} x1="16" y1="12" x2="224" y2="228" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="52%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id={shineId} x1="40" y1="20" x2="180" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={starId} x1="156" y1="32" x2="208" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="224" height="224" rx="54" fill={`url(#${bgId})`} />
      <path
        d="M62 8H178C207.823 8 232 32.1766 232 62V112C182 132 108 118 8 88V62C8 32.1766 32.1766 8 62 8Z"
        fill={`url(#${shineId})`}
      />
      <path
        d="M142 70H92C54 70 52 116 94 124C118 128.5 122 130 132 133C168 142 166 186 124 186H68"
        stroke="#FFFFFF"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M182 32C185.4 50.2 189.8 54.6 208 58C189.8 61.4 185.4 65.8 182 84C178.6 65.8 174.2 61.4 156 58C174.2 54.6 178.6 50.2 182 32Z"
        fill={`url(#${starId})`}
      />
    </svg>
  )
}
