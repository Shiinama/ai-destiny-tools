import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getPaginatedArticles } from '@/actions/ai-content'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { Link } from '@/i18n/navigation'
import { formatDate } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blogs')

  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  }
}

export default async function BlogPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale } = await params
  const { page } = await searchParams
  const currentPage = page ? parseInt(page) : 1
  const pageSize = 18

  const { articles, pagination } = await getPaginatedArticles({
    locale,
    page: currentPage,
    pageSize
  })

  const t = await getTranslations('blogs')

  const publishedArticles = articles.filter((article) => article.publishedAt)

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">{t('pageTitle')}</h1>

      {publishedArticles.length === 0 ? (
        <p className="text-muted-foreground text-center">{t('noArticles')}</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publishedArticles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="bg-card block overflow-hidden rounded-lg border shadow transition-shadow hover:shadow-md"
              >
                <div className="p-6">
                  <h2 className="text-card-foreground mb-2 text-xl font-semibold">{article.title}</h2>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {t('publishedAt', { date: formatDate(article.publishedAt) })}
                  </p>
                  <p className="text-card-foreground/80">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <BlogPagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
          </div>
        </>
      )}
    </div>
  )
}
