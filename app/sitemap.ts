import { unstable_noStore } from 'next/cache'

import { getAllArticles } from '@/actions/ai-content'
import { getPaginatedTools } from '@/actions/divination-tools'
import { locales } from '@/i18n/routing'

import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  unstable_noStore()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const [{ tools }, allArticles] = await Promise.all([
    getPaginatedTools({
      pageSize: 10000,
      page: 1
    }),
    getAllArticles()
  ])

  const divinationTools = tools.map((i) => `/divination-tools/${i.id}`)

  const routes = [
    '/',
    '/tarot',
    '/astrology',
    '/vedic',
    '/iChing',
    '/numerology',
    '/palmistry',
    '/dreamInterpretation',
    '/other',
    '/blogs',
    '/about',
    '/submit-tools',
    ...divinationTools
  ]

  const entries: MetadataRoute.Sitemap = []

  const getUrlPath = (locale: (typeof locales)[0], route: string) => {
    if (locale.code === 'en' && route === '/') return ''
    if (locale.code === 'en') return route
    if (route === '/') return `/${locale.code}`
    return `/${locale.code}${route}`
  }

  for (const route of routes) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}${getUrlPath(locale, route)}`
      })
    }
  }

  const publishedArticles = allArticles
    .filter((article) => article.publishedAt)
    .map((i) => ({
      url: `${baseUrl}/${!i.locale || i.locale === 'en' ? '' : i.locale + '/'}blog/${i.slug}`
    }))

  return [...entries, ...publishedArticles]
}
