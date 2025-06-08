import { getPaginatedTools } from '@/actions/divination-tools'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from '@/i18n/navigation'
import { formatDate } from '@/lib/utils'

export default async function ToolsAdminPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const { page, status } = await searchParams
  const currentPage = page ? parseInt(page) : 1
  const pageSize = 10

  const { tools, pagination } = await getPaginatedTools({
    page: currentPage,
    pageSize,
    status: undefined
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

      <div className="overflow-hidden rounded-lg border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>联系方式</TableHead>
              <TableHead>创建日期</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-[150px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground text-center">
                  没有找到工具
                </TableCell>
              </TableRow>
            ) : (
              tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-muted-foreground max-w-xs truncate text-sm">{tool.url}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tool.categoryKey}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{tool.contactInfo || '未提供'}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(tool.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(tool.status)}>{getStatusText(tool.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Link href={`/admin/tools/edit/${tool.id}`} className="text-primary hover:text-primary/80">
                        编辑
                      </Link>
                      <Link
                        href={`/divination-tools/${tool.id}`}
                        className="text-primary hover:text-primary/80"
                        target="_blank"
                      >
                        查看
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6">
        <BlogPagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      </div>
    </>
  )
}
