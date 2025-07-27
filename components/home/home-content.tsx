import BlogLinkCard from '@/components/blog/blog-link-card'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { CategoryLinks } from '@/components/categories/category-links'
import FeatureItem from '@/components/home/feature-item'
import SortSelector, { SortOption } from '@/components/home/sort-selector'
import SiteCard from '@/components/navigatiton-sites/site-card'
import SearchBox from '@/components/search/search-box'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

interface HomeContentProps {
  search?: string
  t: any
  categories: any[]
  tools: any[]
  pagination: { currentPage: number; totalPages: number }
  specificPosts: any[]
  currentSort?: SortOption
}

export default function HomeContent({
  t,
  categories,
  tools,
  pagination,
  specificPosts,
  search,
  currentSort
}: HomeContentProps) {
  return (
    <div className="text-foreground container min-h-screen rounded-lg py-8">
      <header className="mb-8 space-y-4 text-center">
        <h1 className="text-primary text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mx-auto max-w-4xl text-lg">{t('description')}</p>
        <CategoryLinks categories={categories} />
      </header>

      <SearchBox />

      {typeof search === 'string' && search.trim() !== '' && (
        <div className="text-primary mb-4 text-2xl">
          {t('searchResultsFor')}: <span className="font-semibold">{search}</span>
        </div>
      )}

      <div className="mb-6 flex justify-end">
        <SortSelector currentSort={currentSort} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-12">
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] md:gap-4">
            {tools.length === 0 ? (
              <div className="text-muted-foreground col-span-full flex flex-col items-center justify-center py-16 text-lg">
                {t('noResults')}
              </div>
            ) : (
              tools.map((site) => <SiteCard key={site.id} site={site} />)
            )}
          </div>
          <div className="mt-6">
            <BlogPagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
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
