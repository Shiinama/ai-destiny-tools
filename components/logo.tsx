'use client'

import Image from 'next/image'

import { Link } from '@/i18n/navigation'

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src="/brand-logo.svg" alt="Destiny AI Logo" width={150} height={40} priority />
    </Link>
  )
}

export default Logo
