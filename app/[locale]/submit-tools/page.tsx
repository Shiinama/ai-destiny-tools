import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getCategories } from '@/actions/divination-tools'
import { PremiumBenefits } from '@/components/navigatiton-sites/premium-benefits'
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
    <div className="container flex gap-5 py-10 max-md:flex-col">
      <div className="w-1/2 max-md:w-full">
        <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
        <SubmitSiteForm categories={categories} />
      </div>

      <div className="w-1/2 space-y-4 max-md:mt-10 max-md:w-full">
        <PremiumBenefits />
        <p className="text-foreground p-1 text-justify text-sm">{t('premium.submitToolsDescription')}</p>
        <p className="text-foreground/60 p-1 text-justify text-sm">{t('premium.submitToolsDescription2')}</p>
      </div>
    </div>
  )
}
