'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { useIsMobile } from '@/hooks/use-mobile'
import { Link } from '@/i18n/navigation'

const Logo = () => {
  const t = useTranslations('siteInfo')
  const isMobile = useIsMobile()
  const logoSize = isMobile ? 24 : 32

  return (
    <Link href="/" className="flex items-center gap-2">
      <Image alt="logo" src="/logo.svg" width={logoSize} height={logoSize} />
      <p className="font-semibold md:text-lg">{t('brandName')}</p>
    </Link>
  )
}

export default Logo
