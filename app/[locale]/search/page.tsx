import { getTranslations } from 'next-intl/server'

import { getSpecificPosts } from '@/actions/ai-content'
import { getCategories, getPaginatedTools } from '@/actions/divination-tools'
import HomeContent from '@/components/home/home-content'

interface SearchPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ query?: string; page?: string }>
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const [{ query, page }, { locale }] = await Promise.all([searchParams, params])

  const currentPage = page ? parseInt(page) : 1
  const pageSize = 20

  const [categories, t, sites, specificPosts] = await Promise.all([
    getCategories(),
    getTranslations('HomePage'),
    getPaginatedTools({
      page: currentPage,
      pageSize,
      status: 'approved',
      search: query ? { name: query } : undefined,
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
      search={query}
      t={t}
      categories={categories}
      tools={sites.tools}
      pagination={sites.pagination}
      specificPosts={specificPosts}
    />
  )
}
