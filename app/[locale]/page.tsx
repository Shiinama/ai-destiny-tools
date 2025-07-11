import { getTranslations } from 'next-intl/server'

import { getSpecificPosts } from '@/actions/ai-content'
import { getCategories, getPaginatedTools } from '@/actions/divination-tools'
import BlogLinkCard from '@/components/blog/blog-link-card'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { CategoryLinks } from '@/components/categories/category-links'
import FeatureItem from '@/components/home/feature-item'
import SiteCard from '@/components/navigatiton-sites/site-card'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export default async function Home({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ page }, { locale }] = await Promise.all([searchParams, params])

  const currentPage = page ? parseInt(page) : 1
  const pageSize = 20

  const [categories, t, sites, specificPosts] = await Promise.all([
    getCategories(),
    getTranslations('HomePage'),
    getPaginatedTools({
      page: currentPage,
      pageSize,
      status: 'approved',
      locale: locale
    }),
    getSpecificPosts([
      'ai-divination-future-foresight',
      'ai-fortune-telling-predicting-tomorrow',
      'mainstream-methods-divination-world'
    ])
  ])

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

        <section className="flex flex-col items-center space-y-6">
          <h2 className="text-primary/80 text-3xl font-bold">{t('featuredPosts')}</h2>
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
            {t('viewMore')}
          </Link>
        </section>

        <section className="mt-12 space-y-16">
          <FeatureItem
            imageUrl="https://static.destinyai.tools/ai-destiny-home-feature-1.png"
            imageAlt={t('features.step1_concept.imageAlt')}
            title={t('features.step1_concept.title')}
            description={t('features.step1_concept.description')}
            layout="imageLeft"
          />

          <FeatureItem
            imageUrl="https://static.destinyai.tools/1752300132807-astrological-moon-phase-cover-image.png"
            imageAlt={t('features.step2_howitworks.imageAlt')}
            title={t('features.step2_howitworks.title')}
            description={t('features.step2_howitworks.description')}
            layout="imageRight"
          />

          <FeatureItem
            imageUrl="https://static.destinyai.tools/ai-destiny-home-feature-3.png"
            imageAlt={t('features.step3_types.imageAlt')}
            title={t('features.step3_types.title')}
            description={t('features.step3_types.description')}
            layout="imageLeft"
          />
          <FeatureItem
            imageUrl="https://static.destinyai.tools/ai-destiny-home-feature-2.png"
            imageAlt={t('features.step4_selection.imageAlt')}
            title={t('features.step4_selection.title')}
            description={t('features.step4_selection.description')}
            layout="imageRight"
          />
          <FeatureItem
            imageUrl="https://static.destinyai.tools/1752300089926-april-5-astrological-sign-cover-image.png"
            imageAlt={t('features.step5_guidance.imageAlt')}
            title={t('features.step5_guidance.title')}
            description={t('features.step5_guidance.description')}
            layout="imageLeft"
          />
        </section>
      </div>
    </div>
  )
}
