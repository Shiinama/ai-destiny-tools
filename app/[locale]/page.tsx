import { getTranslations } from 'next-intl/server'

import { getCategories } from '@/actions/ai-navigation/categories'
import { getSites } from '@/actions/ai-navigation/sites'
import { CategoryLinks } from '@/components/categories/category-links'
import SiteCard from '@/components/navigatiton-sites/site-card'

export default async function Home() {
  const { data: categories } = await getCategories()

  const t = await getTranslations('HomePage')

  const { data: sites = [] } = await getSites()

  return (
    <div className="text-foreground container min-h-screen space-y-12 rounded-lg py-8">
      <header className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">{t('description')}</p>
      </header>

      <CategoryLinks categories={categories} />

      <div className="grid grid-cols-1 gap-8">
        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
