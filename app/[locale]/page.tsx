import { getTranslations } from 'next-intl/server'

import { getSpecificPosts } from '@/actions/ai-content'
import { getCategories, getPaginatedTools } from '@/actions/divination-tools'
import HomeContent from '@/components/home/home-content'

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
    <HomeContent
      t={t}
      categories={categories}
      tools={sites.tools}
      pagination={sites.pagination}
      specificPosts={specificPosts}
    />
  )
}
