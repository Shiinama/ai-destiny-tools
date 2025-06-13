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

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">文章列表</h1>
        <div>
          <Link href="/admin/articles/batch">
            <Button>批量创建</Button>
          </Link>
          <Link href="/admin/articles/new">
            <Button className="ml-4" variant="secondary">
              新建文章
            </Button>
          </Link>
        </div>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-lg border shadow">
        <table className="divide-border min-w-full divide-y">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                封面图
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                标题
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                创建日期
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                语言
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                状态
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-border bg-card divide-y">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted-foreground px-6 py-4 text-center">
                  暂无文章
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {article.coverImageUrl && (
                      <img
                        src={article.coverImageUrl}
                        alt={article.title}
                        className="h-16 w-24 rounded-md object-cover"
                      />
                    )}
                  </td>
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
                      {article.publishedAt ? '已发布' : '草稿'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <Link
                      href={`/admin/articles/edit/${article.slug}`}
                      className="text-primary hover:text-primary/80 mr-4"
                    >
                      编辑
                    </Link>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="text-primary hover:text-primary/80 mr-4"
                      target="_blank"
                    >
                      查看
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
