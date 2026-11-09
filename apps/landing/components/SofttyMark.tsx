import React from 'react'

interface SofttyMarkProps {
  size?: number
  className?: string
}

export function SofttyMark({ size = 36, className = '' }: SofttyMarkProps) {
  const uniqueId = React.useId().replace(/:/g, '_')
  const bgId = `softty_c3_bg_${uniqueId}`
  const pdfId = `softty_c3_pdf_${uniqueId}`
  const slideId = `softty_c3_slide_${uniqueId}`
  const sheetId = `softty_c3_sheet_${uniqueId}`
  const docId = `softty_c3_doc_${uniqueId}`
  const shadowId = `softty_c3_shadow_${uniqueId}`
  const starId = `softty_c3_star_${uniqueId}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Softty Office Logo"
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>

        <linearGradient id={pdfId} x1="200" y1="90" x2="390" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        <linearGradient id={slideId} x1="160" y1="120" x2="350" y2="310" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        <linearGradient id={sheetId} x1="120" y1="150" x2="310" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id={docId} x1="80" y1="180" x2="270" y2="370" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#0f172a" floodOpacity="0.22" />
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.14" />
        </filter>

        <linearGradient id={starId} x1="388" y1="105" x2="435" y2="153" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      {/* Rounded Squircle Container with subtle border */}
      <rect width="512" height="512" rx="112" fill={`url(#${bgId})`} stroke="#E2E8F0" strokeWidth="3" />

      <g filter={`url(#${shadowId})`}>
        {/* PDF Card (Red) */}
        <g transform="translate(195, 75) rotate(18)">
          <rect width="170" height="230" rx="20" fill={`url(#${pdfId})`} />
          <rect x="25" y="40" width="80" height="14" rx="7" fill="#ffffff" opacity="0.75" />
          <rect x="25" y="70" width="120" height="10" rx="5" fill="#ffffff" opacity="0.45" />
          <text x="135" y="200" fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" fontWeight="900" fontSize="28" fill="#ffffff" textAnchor="end" opacity="0.92">PDF</text>
        </g>

        {/* PPT Card (Orange) */}
        <g transform="translate(155, 105) rotate(6)">
          <rect width="170" height="230" rx="20" fill={`url(#${slideId})`} />
          <circle cx="85" cy="100" r="35" fill="#ffffff" opacity="0.35" />
          <rect x="25" y="160" width="120" height="10" rx="5" fill="#ffffff" opacity="0.5" />
          <text x="135" y="200" fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" fontWeight="900" fontSize="28" fill="#ffffff" textAnchor="end" opacity="0.92">PPT</text>
        </g>

        {/* XLS Card (Green) */}
        <g transform="translate(115, 140) rotate(-6)">
          <rect width="170" height="230" rx="20" fill={`url(#${sheetId})`} />
          <rect x="25" y="45" width="120" height="90" rx="8" fill="#ffffff" opacity="0.25" />
          <path d="M25 75 H145 M25 105 H145 M65 45 V135 M105 45 V135" stroke="#ffffff" strokeWidth="2.5" opacity="0.6" />
          <text x="135" y="200" fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" fontWeight="900" fontSize="28" fill="#ffffff" textAnchor="end" opacity="0.92">XLS</text>
        </g>

        {/* DOC Card (Blue) */}
        <g transform="translate(85, 175) rotate(-16)">
          <rect width="175" height="235" rx="22" fill={`url(#${docId})`} />
          <path d="M125 0 V45 C125 50 130 55 135 55 H175 Z" fill="#93C5FD" opacity="0.9" />
          <path
            d="M125 90 H80 C60 90 55 115 80 120 C100 124 105 128 105 138 C105 155 85 160 65 160"
            stroke="#ffffff"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="140" y="205" fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" fontWeight="900" fontSize="28" fill="#ffffff" textAnchor="end" opacity="0.95">DOC</text>
        </g>
      </g>

      {/* AI Star */}
      <path
        d="M410 105 C412 122 418 127 435 129 C418 131 412 136 410 153 C408 136 402 131 385 129 C402 127 408 122 410 105 Z"
        fill={`url(#${starId})`}
      />
      <circle cx="410" cy="129" r="6" fill="#ffffff" opacity="0.85" />
    </svg>
  )
}
