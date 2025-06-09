import { getTranslations } from 'next-intl/server'

import { getCategories, getPaginatedTools } from '@/actions/divination-tools'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { CategoryLinks } from '@/components/categories/category-links'
import SiteCard from '@/components/navigatiton-sites/site-card'

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

  return (
    <div className="text-foreground container min-h-screen rounded-lg py-8">
      <header className="mb-8 space-y-4 text-center">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
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
      </div>
    </div>
  )
}
