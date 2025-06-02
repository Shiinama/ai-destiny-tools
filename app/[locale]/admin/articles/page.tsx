import { getTranslations } from 'next-intl/server'

import { getPaginatedArticles } from '@/actions/ai-content'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'
import { formatDate } from '@/lib/utils'

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const currentPage = page ? parseInt(page) : 1
  const pageSize = 10

  const { articles, pagination } = await getPaginatedArticles({
    page: currentPage,
    pageSize
  })

  const t = await getTranslations('admin.list')

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div>
          <Link href="/admin/articles/batch">
            <Button>{t('buttons.batchCreate')}</Button>
          </Link>
          <Link href="/admin/articles/new">
            <Button className="ml-4" variant="secondary">
              {t('buttons.createNew')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-lg border shadow">
        <table className="divide-border min-w-full divide-y">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                {t('table.headers.title')}
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                {t('table.headers.createdDate')}
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                {t('table.headers.language')}
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                {t('table.headers.status')}
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                {t('table.headers.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-border bg-card divide-y">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted-foreground px-6 py-4 text-center">
                  {t('table.noArticles')}
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{article.title}</div>
                    <div className="text-muted-foreground truncate text-sm">{article.slug}</div>
                  </td>
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">
                    {formatDate(article.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline">{locales.find((i) => i.code === article.locale)?.name}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={article.publishedAt ? 'success' : 'secondary'}>
                      {article.publishedAt ? t('status.published') : t('status.draft')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <Link
                      href={`/admin/articles/edit/${article.slug}`}
                      className="text-primary hover:text-primary/80 mr-4"
                    >
                      {t('actions.edit')}
                    </Link>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="text-primary hover:text-primary/80 mr-4"
                      target="_blank"
                    >
                      {t('actions.view')}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <BlogPagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      </div>
    </>
  )
}
