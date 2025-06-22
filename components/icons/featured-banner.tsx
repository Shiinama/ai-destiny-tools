'use client'

import { Check } from 'lucide-react'
import React, { useId } from 'react'

import { cn } from '@/lib/utils'

interface FeaturedBannerProps {
  className?: string
}

export const FeaturedBanner: React.FC<FeaturedBannerProps> = ({ className }) => {
  const uniqueId = useId()
  const letterGradientId = `letter-gradient-${uniqueId}`
  const accentGradientId = `accent-gradient-${uniqueId}`

  return (
    <div className={cn('bg-card/80 relative flex items-center rounded-lg px-6 py-3', className)}>
      <svg width={40} height={60} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 72">
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
      </svg>

      <div className="ml-1 flex flex-col whitespace-nowrap">
        <div className="text-muted-foreground text-sm font-medium tracking-wider uppercase">Featured on</div>
        <div className="text-foreground text-xl font-bold">Destiny AI Tools</div>
      </div>

      <div className="bg-primary ml-4 rounded-full p-1">
        <Check className="text-primary-foreground size-5" />
      </div>
    </div>
  )
}

export const FeaturedBannerLight: React.FC<FeaturedBannerProps> = ({ className }) => {
  const uniqueId = useId()
  const letterGradientId = `letter-gradient-light-${uniqueId}`
  const accentGradientId = `accent-gradient-light-${uniqueId}`

  return (
    <div className={cn('relative flex items-center border-gray-200 bg-white px-6 py-3 shadow-sm', className)}>
      <svg width={40} height={60} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 72">
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
      </svg>

      <div className="ml-1 flex flex-col whitespace-nowrap">
        <div className="text-sm font-medium tracking-wider text-gray-500 uppercase">Featured on</div>
        <div className="text-xl font-bold text-gray-900">Destiny AI Tools</div>
      </div>

      <div className="bg-primary ml-4 rounded-full p-1">
        <Check className="text-primary-foreground size-5" />
      </div>
    </div>
  )
}
