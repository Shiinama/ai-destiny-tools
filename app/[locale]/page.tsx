import { getTranslations } from 'next-intl/server'

import { getSpecificPosts } from '@/actions/ai-content'
import { getCategories, getPaginatedTools, SortOption } from '@/actions/divination-tools'
import HomeContent from '@/components/home/home-content'

export default async function Home({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}) {
  const [{ page, sort }, { locale }] = await Promise.all([searchParams, params])

  const currentPage = page ? parseInt(page) : 1
  const currentSort = (sort as SortOption) || 'default'
  const pageSize = 20

  const [categories, t, sites, specificPosts] = await Promise.all([
    getCategories(),
    getTranslations('HomePage'),
    getPaginatedTools({
      page: currentPage,
      pageSize,
      status: 'approved',
      locale: locale,
      sort: currentSort
    }),
    getSpecificPosts([
      'ai-divination-future-foresight',
      'ai-fortune-telling-predicting-tomorrow',
      'mainstream-methods-divination-world'
    ])
  ])

  return (
    <HomeContent
      t={t}
      categories={categories}
      tools={sites.tools}
      pagination={sites.pagination}
      specificPosts={specificPosts}
      currentSort={currentSort}
    />
  )
}
