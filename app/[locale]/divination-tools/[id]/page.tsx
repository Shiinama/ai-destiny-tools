import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getToolById } from '@/actions/divination-tools'
import AboutSection from '@/app/[locale]/divination-tools/[id]/components/about-section'
import AccessToolCard from '@/app/[locale]/divination-tools/[id]/components/access-tool-card'
import HeroSection from '@/app/[locale]/divination-tools/[id]/components/hero-section'
import PricingCard from '@/app/[locale]/divination-tools/[id]/components/pricing-card'
import ScreenshotsSection from '@/app/[locale]/divination-tools/[id]/components/screenshots-section'

interface DivinationToolPageProps {
  params: Promise<{
    id: string
    locale: string
  }>
}
export async function generateMetadata({ params }: DivinationToolPageProps): Promise<Metadata> {
  const { id, locale } = await params

  const t = await getTranslations('divinationTools')

  const tool = await getToolById(id, locale)

  if (!tool) {
    return {
      title: t('toolNotFound'),
      description: t('toolNotFoundDescription')
    }
  }
  const title = `${tool.name} - ${tool.categoryKey}`

  return {
    title: title,
    description: tool.description
  }
}

export default async function DivinationToolPage({ params }: DivinationToolPageProps) {
  const { id, locale } = await params

  const tool = await getToolById(id, locale)

  return (
    <div className="container mx-auto py-8">
      <HeroSection tool={tool} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScreenshotsSection tool={tool} />
          <AboutSection content={tool.content} />
        </div>

        <div className="space-y-6">
          <AccessToolCard tool={tool} />
          <PricingCard tool={tool} />
        </div>
      </div>
    </div>
  )
}
