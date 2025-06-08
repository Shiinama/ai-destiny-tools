import { getPaginatedTools } from '@/actions/divination-tools'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { ToolStatus } from '@/lib/db/schema'
import { formatDate } from '@/lib/utils'

export default async function ToolsAdminPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; status?: ToolStatus }>
}) {
  const { page, status } = await searchParams
  const currentPage = page ? parseInt(page) : 1
  const pageSize = 10

  const { tools, pagination } = await getPaginatedTools({
    page: currentPage,
    pageSize,
    status: status
  })

  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Helper function to get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已批准'
      case 'rejected':
        return '已拒绝'
      case 'pending':
        return '待审核'
      default:
        return status
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">占卜工具管理</h1>
        <div>
          <Link href="/admin/tools/new">
            <Button variant="secondary">新建工具</Button>
          </Link>
        </div>
      </div>

      {/* Filter controls */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/tools">
          <Button variant={!status ? 'default' : 'outline'} size="sm">
            全部
          </Button>
        </Link>
        <Link href="/admin/tools?status=pending">
          <Button variant={status === 'pending' ? 'default' : 'outline'} size="sm">
            待审核
          </Button>
        </Link>
        <Link href="/admin/tools?status=approved">
          <Button variant={status === 'approved' ? 'default' : 'outline'} size="sm">
            已批准
          </Button>
        </Link>
        <Link href="/admin/tools?status=rejected">
          <Button variant={status === 'rejected' ? 'default' : 'outline'} size="sm">
            已拒绝
          </Button>
        </Link>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-lg border shadow">
        <table className="divide-border min-w-full divide-y">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                名称
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                分类
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                联系方式
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                创建日期
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
            {tools.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted-foreground px-6 py-4 text-center">
                  没有找到工具
                </td>
              </tr>
            ) : (
              tools.map((tool) => (
                <tr key={tool.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{tool.name}</div>
                    <div className="text-muted-foreground max-w-xs truncate text-sm">{tool.url}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline">{tool.categoryKey}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{tool.contactInfo || '未提供'}</div>
                  </td>
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">
                    {formatDate(tool.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(tool.status)}>{getStatusText(tool.status)}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <Link href={`/admin/tools/edit/${tool.id}`} className="text-primary hover:text-primary/80 mr-4">
                      编辑
                    </Link>
                    <Link
                      href={`/divination-tools/${tool.id}`}
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
