'use server'

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
      <h1 className="mb-6 text-2xl font-bold">{t(`${category.key}.name` as any)}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    </div>
  )
}
