import { useTranslations } from 'next-intl'

import Logo from '@/components/logo'
import { Link } from '@/i18n/navigation'
import { getCategoryDisplayName } from '@/lib/utils'

import DiscordBtn from './discord'

export default function Footer() {
  const t = useTranslations('footer')
  const divinationCategories = useTranslations('divinationCategories')

  const categoryKey1 = ['tarot', 'astrology', 'vedic', 'numerology', 'iChing']

  const categoryKey2 = ['palmistry', 'dreamInterpretation', 'comprehensive', 'other']

  return (
    <footer className="px-4 py-8 sm:px-6 lg:px-18">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="flex flex-col items-start space-y-2">
          <Logo />
          <p className="text-muted-foreground mt-2 max-w-80">{t('description')}</p>
          <DiscordBtn />
        </div>

        <div className="flex flex-col items-start space-y-2">
          <h3 className="text-foreground text-lg font-semibold">{t('contact.title')}</h3>
          <p className="text-muted-foreground mt-2">{t('contact.intro')}</p>
          <p className="text-primary mt-2 hover:underline">{t('contact.email')}</p>
        </div>

        <div className="flex flex-col items-start space-y-2">
          <h3 className="text-foreground text-lg font-semibold">{t('quickLinks.title')}</h3>
          <div className="mt-4 flex flex-col space-y-2">
            {categoryKey1.map((key) => {
              const displayName = divinationCategories(`${key}.name` as any)
              const nameToShow = getCategoryDisplayName(displayName)
              return (
                <Link key={key} href={`/${key}`} className="text-muted-foreground hover:text-primary">
                  {nameToShow}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="flex flex-col items-start space-y-2">
          <h3 className="text-foreground text-lg font-semibold">{t('categories')}</h3>
          <div className="mt-4 flex flex-col space-y-2">
            {categoryKey2.map((key) => {
              const displayName = divinationCategories(`${key}.name` as any)
              const nameToShow = getCategoryDisplayName(displayName)
              return (
                <Link key={key} href={`/${key}`} className="text-muted-foreground hover:text-primary">
                  {nameToShow}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-border text-muted-foreground mt-8 border-t pt-8 text-center text-sm">{t('copyright')}</div>
    </footer>
  )
}
