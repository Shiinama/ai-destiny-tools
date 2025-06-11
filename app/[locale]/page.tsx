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
    'ai-fortune-teller-online-unveil-future',
    'free-ai-fortune-teller-tools',
    'ai-fortune-teller-app-guide',
    'ai-fortune-cookies-future-wisdom'
  ]
  const specificPosts = await getSpecificPosts(specificSlugs)

  return (
    <div className="text-foreground container min-h-screen rounded-lg py-8">
      <header className="mb-8 space-y-4 text-center">
        <h1 className="text-primary text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">{t('description')}</p>
        <CategoryLinks categories={categories} />
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] md:gap-4">
            {sites.tools.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        </section>
        <div className="mt-6">
          <BlogPagination currentPage={sites.pagination.currentPage} totalPages={sites.pagination.totalPages} />
        </div>

        <section className="mt-8">
          <h2 className="text-primary mb-4 text-2xl font-bold">{t('featuredPosts')}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {specificPosts.map((post) => (
              <div key={post.id} className="bg-secondary rounded-lg p-4 shadow-lg">
                <Link href={`/blog/${post.slug}`} className="text-foreground/80 text-xl font-semibold hover:underline">
                  {post.title}
                </Link>
                <p className="text-muted-foreground mt-2 line-clamp-4">{post.excerpt}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
