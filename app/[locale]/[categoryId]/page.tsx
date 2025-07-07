'use server'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { getSpecificPosts } from '@/actions/ai-content'
import { getCategories, getPaginatedTools } from '@/actions/divination-tools'
import BlogLinkCard from '@/components/blog/blog-link-card'
import { BlogPagination } from '@/components/blog/blog-pagination'
import SiteCard from '@/components/navigatiton-sites/site-card'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { truncateWithEllipsis } from '@/lib/utils'

interface CategoryPageProps {
  params: Promise<{
    categoryId: string
    locale: string
  }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params

  const t = await getTranslations('divinationCategories')

  const categories = await getCategories()
  const category = categories?.find((cat) => cat.key === categoryId)

  if (!category) {
    return {
      title: truncateWithEllipsis(t('categoryNotFound'), 44),
      description: truncateWithEllipsis(t('categoryNotFoundDescription'), 157)
    }
  }

  return {
    title: truncateWithEllipsis(t(`${category.key}.seoTitle` as any), 44),
    description: truncateWithEllipsis(t(`${category.key}.seoDescription` as any), 157)
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categoryId, locale } = await params
  const { page } = await searchParams
  const home = await getTranslations('HomePage')

  const t = await getTranslations('divinationCategories')

  let links: string[] = []
  if (categoryId === 'astrology') {
    links = [
      'astrology-ai-chat-modern-oracle',
      'what-is-an-ai-astrologer-celestial-guide',
      'ai-astrology-cosmic-code-unlocked'
    ]
  } else if (categoryId === 'tarot') {
    links = [
      'what-is-ai-tarot-digital-divination-guide',
      'ai-tarot-reading-digital-oracle-guide',
      'tarot-ai-digital-divination-guide'
    ]
  } else if (categoryId === 'vedic') {
    links = [
      'vedic-astrology-chart-ai',
      'vedic-astrology-ai-cosmic-blueprint-guide',
      'vedic-astrology-reading-ai-cosmic-insights'
    ]
  } else if (categoryId === 'iChing') {
    links = ['i-ching-online-digital-oracle-guide-2025', 'i-ching-divination-guide-modern-wisdom']
  } else if (categoryId === 'numerology') {
    links = [
      'numerology-ai-bot-guide',
      'numerology-ai-tool-digital-destiny',
      'ai-for-numerology-cosmic-code-decrypted',
      'numerology-ai-digital-divination-guide'
    ]
  } else if (categoryId === 'palmistry') {
    links = [
      'palmistry-ai-reading-your-future-in-your-hand',
      'how-to-read-palms-a-mystics-guide-to-your-fate',
      'palmistry-chart-guide-to-reading-your-destiny',
      'palmistry-palm-reading-guide-to-your-destiny'
    ]
  } else if (categoryId === 'dreamInterpretation') {
    links = [
      'islamic-dream-interpretation-ai-soul-vs-code',
      'dream-interpretation-ai-a-modern-oracle-for-spiritual-growth',
      'ai-dream-interpreter-divination-guide',
      'real-time-text-to-image-ai-dream-interpretation-divination'
    ]
  }

  const specificPosts = await getSpecificPosts(links)

  const currentPage = page ? parseInt(page) : 1
  const pageSize = 12
  const categories = await getCategories()
  const category = categories?.find((cat) => cat.key === categoryId)

  if (!category) {
    return notFound()
  }
  const { pagination, tools } = await getPaginatedTools({
    page: currentPage,
    pageSize,
    status: 'approved',
    categoryId: category.id,
    locale
  })

  return (
    <div className="container py-8">
      <header className="mb-8 space-y-4 text-center">
        <h1 className="text-primary text-4xl font-bold">{t(`${category.key}.name` as any)}</h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">{t(`${category.key}.description` as any)}</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:gap-12">
        <section className="space-y-4">
          {tools.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] md:gap-4">
              {tools.map((site) => (
                <SiteCard key={site.id} site={site} />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              <p>No tools available in this category yet.</p>
            </div>
          )}
          <div className="mt-6">
            <BlogPagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
          </div>
        </section>

        {specificPosts.length > 0 && (
          <section className="flex flex-col items-center space-y-6">
            <h2 className="text-primary/80 text-3xl font-bold">{home('featuredPosts')}</h2>
            <div className="space-y-4">
              {specificPosts.map((article) => (
                <BlogLinkCard
                  key={article.id}
                  id={article.id}
                  slug={article.slug}
                  title={article.title}
                  excerpt={article.excerpt}
                  coverImageUrl={article.coverImageUrl!}
                />
              ))}
            </div>
            <Link className={buttonVariants({ variant: 'default', size: 'lg', className: 'w-40' })} href="/blogs">
              {home('viewMore')}
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
