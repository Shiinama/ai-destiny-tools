'use client'

import React, { useId } from 'react'

interface BrandLogoProps {
  width?: number
  height?: number
  className?: string
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ width = 180, height = 72, className }) => {
  const uniqueId = useId()
  const letterGradientId = `letter-gradient-${uniqueId}`
  const accentGradientId = `accent-gradient-${uniqueId}`

  return (
    <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 72" className={className}>
      <defs>
        <linearGradient id={letterGradientId} gradientTransform="rotate(45)">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id={accentGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      <path
        d="M0 20H12C22 20 30 29 30 40C30 51 22 60 12 60H0V20Z
         M5 25V55H12C19 55 25 48 25 40C25 32 19 25 12 25H5Z"
        fill={`url(#${letterGradientId})`}
      />

      <circle cx="6" cy="30" r="1.5" fill="#F8FAFC" />
      <circle cx="26" cy="50" r="1.5" fill="#F8FAFC" />
      <circle cx="21" cy="25" r="1" fill="#F8FAFC" opacity="0.7" />
      <circle cx="11" cy="55" r="1" fill="#F8FAFC" opacity="0.7" />

      <path d="M-4 40H36" stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="5 3" opacity="0.3" />
      <path d="M16 20V60" stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="5 3" opacity="0.3" />

      <path
        d="M26 30C31 32 33 36 33 40"
        stroke="#A855F7"
        strokeWidth="0.75"
        fill="none"
        strokeDasharray="3 2"
        opacity="0.6"
      />
      <path
        d="M26 50C31 48 33 44 33 40"
        stroke="#A855F7"
        strokeWidth="0.75"
        fill="none"
        strokeDasharray="3 2"
        opacity="0.6"
      />

      <path d="M1 25L2 28L-1 26.5H3L0 28L1 25Z" fill="#F8FAFC" opacity="0.8" />
      <path d="M26 55L27 58L24 56.5H28L25 58L26 55Z" fill="#F8FAFC" opacity="0.6" />

      <text
        x="33"
        y="52"
        fontFamily="Arial, sans-serif"
        fontWeight="500"
        fontSize="36"
        fill="#F8FAFC"
        letterSpacing="0.5"
      >
        estiny AI
      </text>

      <path
        d="M32 75 C52 72 72 64 92 67 C112 70 132 67 152 64"
        stroke={`url(#${accentGradientId})`}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}
