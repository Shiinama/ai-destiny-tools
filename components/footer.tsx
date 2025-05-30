import { useTranslations } from 'next-intl'

import Logo from '@/components/logo'
import { Link } from '@/i18n/navigation'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="px-4 py-8 sm:px-6 lg:px-18">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-3">
        <div className="flex flex-col items-start space-y-2">
          <Logo />
          <p className="text-muted-foreground mt-2 max-w-80">{t('description')}</p>
        </div>

        <div className="flex flex-col items-start space-y-2">
          <h3 className="text-foreground text-lg font-semibold">{t('contact.title')}</h3>
          <p className="text-muted-foreground mt-2">{t('contact.intro')}</p>
          <p className="text-primary mt-2 hover:underline">{t('contact.email')}</p>
        </div>

        <div className="flex flex-col items-start space-y-2">
          <h3 className="text-foreground text-lg font-semibold">{t('quickLinks.title')}</h3>
          <div className="mt-4 flex flex-col space-y-2">
            <Link href="/" className="text-muted-foreground hover:text-primary">
              {t('quickLinks.home')}
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-primary">
              {t('quickLinks.aboutUs')}
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-primary">
              {t('quickLinks.refundPolicy')}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-border text-muted-foreground mt-8 border-t pt-8 text-center text-sm">{t('copyright')}</div>
    </footer>
  )
}
