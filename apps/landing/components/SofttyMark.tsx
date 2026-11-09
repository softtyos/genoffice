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
          <stop offset="0%" stopColor="#090d16" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>

        <linearGradient id={pdfId} x1="200" y1="90" x2="390" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>

        <linearGradient id={slideId} x1="160" y1="120" x2="350" y2="310" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>

        <linearGradient id={sheetId} x1="120" y1="150" x2="310" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id={docId} x1="80" y1="180" x2="270" y2="370" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="20" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      <rect width="512" height="512" rx="112" fill={`url(#${bgId})`} />

      <g filter={`url(#${shadowId})`}>
        {/* PDF Card (Red) */}
        <g transform="translate(195, 75) rotate(18)">
          <rect width="170" height="230" rx="20" fill={`url(#${pdfId})`} />
          <rect x="25" y="40" width="80" height="14" rx="7" fill="#ffffff" opacity="0.6" />
          <rect x="25" y="70" width="120" height="10" rx="5" fill="#ffffff" opacity="0.35" />
          <text x="135" y="200" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="28" fill="#ffffff" textAnchor="end" opacity="0.7">PDF</text>
        </g>

        {/* PPT Card (Orange) */}
        <g transform="translate(155, 105) rotate(6)">
          <rect width="170" height="230" rx="20" fill={`url(#${slideId})`} />
          <circle cx="85" cy="100" r="35" fill="#ffffff" opacity="0.3" />
          <rect x="25" y="160" width="120" height="10" rx="5" fill="#ffffff" opacity="0.4" />
          <text x="135" y="200" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="28" fill="#ffffff" textAnchor="end" opacity="0.7">PPT</text>
        </g>

        {/* XLS Card (Green) */}
        <g transform="translate(115, 140) rotate(-6)">
          <rect width="170" height="230" rx="20" fill={`url(#${sheetId})`} />
          <rect x="25" y="45" width="120" height="90" rx="8" fill="#ffffff" opacity="0.2" />
          <path d="M25 75 H145 M25 105 H145 M65 45 V135 M105 45 V135" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
          <text x="135" y="200" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="28" fill="#ffffff" textAnchor="end" opacity="0.7">XLS</text>
        </g>

        {/* DOC Card (Blue) */}
        <g transform="translate(85, 175) rotate(-16)">
          <rect width="175" height="235" rx="22" fill={`url(#${docId})`} stroke="#60a5fa" strokeWidth="2" strokeOpacity="0.5" />
          <path d="M125 0 V45 C125 50 130 55 135 55 H175 Z" fill="#93c5fd" opacity="0.8" />
          <path
            d="M125 90 H80 C60 90 55 115 80 120 C100 124 105 128 105 138 C105 155 85 160 65 160"
            stroke="#ffffff"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="140" y="205" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="28" fill="#ffffff" textAnchor="end" opacity="0.9">DOC</text>
        </g>
      </g>

      <path
        d="M410 110 C412 125 417 129 432 131 C417 133 412 137 410 152 C408 137 403 133 388 131 C403 129 408 125 410 110 Z"
        fill="#38bdf8"
      />
    </svg>
  )
}
