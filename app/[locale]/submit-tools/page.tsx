import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getCategories } from '@/actions/divination-tools'
import SubmitSiteForm from '@/components/navigatiton-sites/submit-site-form'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('submitTools')
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function SubmitSitePage() {
  const categories = await getCategories()
  const t = await getTranslations('submitTools')

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
      <SubmitSiteForm categories={categories} />
    </div>
  )
}
