import { getPaginatedTools, getCategories } from '@/actions/divination-tools'
import ReorderTools from '@/components/admin/ReorderTools'
import { BlogPagination } from '@/components/blog/blog-pagination'
import CategoryFilter from '@/components/navigatiton-sites/category-filter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'
import { formatDate } from '@/lib/utils'

export default async function ToolsAdminPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; status?: string; categoryId?: string }>
}) {
  const { page, status, categoryId } = await searchParams
  const currentPage = page ? parseInt(page) : 1
  const pageSize = 10

  const categories = await getCategories()

  const { tools, pagination } = await getPaginatedTools({
    page: currentPage,
    pageSize,
    status: status as any,
    categoryId: categoryId === 'all' ? undefined : categoryId
  })

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

  const buildFilterUrl = (newStatus?: string) => {
    const params = new URLSearchParams()

    if (newStatus) {
      params.set('status', newStatus)
    }

    if (categoryId) {
      params.set('categoryId', categoryId)
    }

    const queryString = params.toString()
    return `/admin/tools${queryString ? `?${queryString}` : ''}`
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

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Link href={buildFilterUrl(undefined)}>
            <Button variant={!status ? 'default' : 'outline'} size="sm">
              全部
            </Button>
          </Link>
          <Link href={buildFilterUrl('pending')}>
            <Button variant={status === 'pending' ? 'default' : 'outline'} size="sm">
              待审核
            </Button>
          </Link>
          <Link href={buildFilterUrl('approved')}>
            <Button variant={status === 'approved' ? 'default' : 'outline'} size="sm">
              已批准
            </Button>
          </Link>
          <Link href={buildFilterUrl('rejected')}>
            <Button variant={status === 'rejected' ? 'default' : 'outline'} size="sm">
              已拒绝
            </Button>
          </Link>
          <CategoryFilter categories={categories} currentCategoryId={categoryId} currentStatus={status} />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                重新排序
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>重新排序工具</DialogTitle>
                <DialogDescription>拖动工具以重新排序。</DialogDescription>
              </DialogHeader>
              <ReorderTools />
              <DialogClose asChild>
                <Button variant="secondary" className="mt-4">
                  关闭
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>语言</TableHead>
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
                  <TableCell> {locales.find((locale) => locale.code === tool.locale)?.name}</TableCell>
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
