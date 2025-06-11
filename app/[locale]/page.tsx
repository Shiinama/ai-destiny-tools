import { getTranslations } from 'next-intl/server'

import { getSpecificPosts } from '@/actions/ai-content'
import { getCategories, getPaginatedTools } from '@/actions/divination-tools'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { CategoryLinks } from '@/components/categories/category-links'
import SiteCard from '@/components/navigatiton-sites/site-card'
import { Link } from '@/i18n/navigation'

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams

  const categories = await getCategories()

  const currentPage = page ? parseInt(page) : 1
  const pageSize = 12

  const t = await getTranslations('HomePage')

  const sites = await getPaginatedTools({
    page: currentPage,
    pageSize,
    status: 'approved'
  })

  const specificSlugs = [
    'ai-divination-future-foresight',
    'ai-fortune-telling-predicting-tomorrow',
    'mainstream-methods-divination-world'
  ]
  const specificPosts = await getSpecificPosts(specificSlugs)

  return (
    <div className="text-foreground container min-h-screen rounded-lg py-8">
      <header className="mb-8 space-y-4 text-center">
        <h1 className="text-primary text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">{t('description')}</p>
        <CategoryLinks categories={categories} />
      </header>

      <div className="grid grid-cols-1 gap-6 md:gap-12">
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] md:gap-4">
            {sites.tools.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
          <div className="mt-6">
            <BlogPagination currentPage={sites.pagination.currentPage} totalPages={sites.pagination.totalPages} />
          </div>
        </section>

        <section>
          <h2 className="text-primary mb-6 text-2xl font-bold">{t('featuredPosts')}</h2>
          <div className="space-y-4">
            {specificPosts.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="flex cursor-pointer items-center space-x-2"
              >
                {article.coverImageUrl && (
                  <div className="w-1/4">
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      className="h-full w-full rounded-lg object-cover"
                      style={{ aspectRatio: '16/9' }}
                    />
                  </div>
                )}
                <div className="w-3/4">
                  <h2 className="mb-1 text-xl font-semibold text-white">{article.title}</h2>

                  <p className="text-gray-300">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
