import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { getToolById, getToolsByCategory } from '@/actions/divination-tools'
import AboutSection from '@/app/[locale]/divination-tools/[id]/components/about-section'
import AccessToolCard from '@/app/[locale]/divination-tools/[id]/components/access-tool-card'
import HeroSection from '@/app/[locale]/divination-tools/[id]/components/hero-section'
import PricingCard from '@/app/[locale]/divination-tools/[id]/components/pricing-card'
import RelatedTools from '@/app/[locale]/divination-tools/[id]/components/related-tools'
import ScreenshotsSection from '@/app/[locale]/divination-tools/[id]/components/screenshots-section'
import { divinationTools } from '@/lib/db/schema'
import { truncateWithEllipsis } from '@/lib/utils'

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
    title: truncateWithEllipsis(title, 44),
    description: truncateWithEllipsis(tool.description, 157)
  }
}

export default async function DivinationToolPage({ params }: DivinationToolPageProps) {
  const { id, locale } = await params

  const tool = await getToolById(id, locale)

  return (
    <div className="container mx-auto py-8">
      <HeroSection tool={tool} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <ScreenshotsSection tool={tool} />
          <AboutSection content={tool.content} />
          <Suspense fallback={null}>
            <RelatedToolsComponent tool={tool} locale={locale} />
          </Suspense>
        </div>

        <div className="space-y-6">
          <AccessToolCard tool={tool} />
          <PricingCard tool={tool} />
        </div>
      </div>
    </div>
  )
}
const RelatedToolsComponent = async ({
  tool,
  locale
}: {
  tool: typeof divinationTools.$inferSelect & { categoryKey: string | null }
  locale: string
}) => {
  const relatedTools = await getToolsByCategory(tool.categoryId, tool.id, locale, 6)
  return <RelatedTools currentTool={tool} relatedTools={relatedTools} />
}
