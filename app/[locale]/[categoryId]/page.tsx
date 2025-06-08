'use server'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { getCategories } from '@/actions/ai-navigation/categories'
import { getSites } from '@/actions/ai-navigation/sites'
import SiteCard from '@/components/navigatiton-sites/site-card'

interface CategoryPageProps {
  params: Promise<{
    categoryId: string
  }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params
  const t = await getTranslations('divinationCategories')

  const { data: categories } = await getCategories()
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params
  const t = await getTranslations('divinationCategories')

  const { data: categories } = await getCategories()
  const category = categories?.find((cat) => cat.key === categoryId)

  if (!category) {
    return notFound()
  }

  const { data: sites } = await getSites(category.id)

  return (
    <div className="container py-8">
      <header className="mb-8 text-center">
        <h1 className="mb-3 text-3xl font-bold">{t(`${category.key}.name` as any)}</h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">{t(`${category.key}.description` as any)}</p>
      </header>

      {sites.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground py-12 text-center">
          <p>No tools available in this category yet.</p>
        </div>
      )}
    </div>
  )
}
