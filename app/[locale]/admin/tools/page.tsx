import { getPaginatedTools, getCategories } from '@/actions/divination-tools'
import ReorderTools from '@/components/admin/ReorderTools'
import { BlogPagination } from '@/components/blog/blog-pagination'
import CategoryFilter from '@/components/navigatiton-sites/category-filter'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

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

      {/* Filter controls */}
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
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border shadow">
        <ReorderTools tools={tools as any} currentPage={pagination.currentPage} itemsPerPage={pageSize} />
      </div>

      <div className="mt-6">
        <BlogPagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      </div>
    </>
  )
}
