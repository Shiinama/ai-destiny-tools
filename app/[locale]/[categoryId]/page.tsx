'use server'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { getCategories, getPaginatedTools } from '@/actions/divination-tools'
import { BlogPagination } from '@/components/blog/blog-pagination'
import SiteCard from '@/components/navigatiton-sites/site-card'

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
  const t = await getTranslations('divinationCategories')

  const currentPage = page ? parseInt(page) : 1
  const pageSize = 18
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

      {tools.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
    </div>
  )
}
