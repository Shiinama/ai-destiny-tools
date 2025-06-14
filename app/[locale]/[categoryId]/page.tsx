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

interface CategoryPageProps {
  params: Promise<{
    categoryId: string
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
      title: t('categoryNotFound'),
      description: t('categoryNotFoundDescription')
    }
  }

  return {
    title: t(`${category.key}.seoTitle` as any),
    description: t(`${category.key}.seoDescription` as any)
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categoryId } = await params
  const { page } = await searchParams
  const home = await getTranslations('HomePage')

  const t = await getTranslations('divinationCategories')

  let links: string[] = []
  if (categoryId === 'astrology') {
    links = [
      'astrology-ai-chat-modern-oracle',
      'what-is-an-ai-astrologer-celestial-guide',
      'ai-astrology-cosmic-code-unlocked',
      'astrology-ai-chat-modern-oracle'
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
    categoryId: category.id
  })

  return (
    <div className="container py-8">
      <header className="mb-8 text-center">
        <h1 className="mb-3 text-3xl font-bold">{t(`${category.key}.name` as any)}</h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">{t(`${category.key}.description` as any)}</p>
      </header>

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
  )
}
