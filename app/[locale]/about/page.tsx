import { getTranslations } from 'next-intl/server'

export default async function AboutPage() {
  const t = await getTranslations('about')

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">{t('title')}</h1>

      <div className="text-accent-foreground/90 max-w-3xl space-y-8 text-xl">
        <p>{t('paragraph1')}</p>
        <p>{t('paragraph2')}</p>
        <p>{t('paragraph3')}</p>
        <p>{t('paragraph4')}</p>
        <p>{t('paragraph5')}</p>
        <p>{t('paragraph6')}</p>
      </div>
    </div>
  )
}
