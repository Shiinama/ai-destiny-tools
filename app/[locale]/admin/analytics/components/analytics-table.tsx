'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from '@/i18n/navigation'

interface ToolAnalyticsOverview {
  toolId: string
  toolName: string
  totalVisits: number
  uniqueVisitors: number
  todayVisits: number
  yesterdayVisits: number
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface AnalyticsTableProps {
  initialData?: ToolAnalyticsOverview[]
  initialPagination?: PaginationInfo
}

export function AnalyticsTable({ initialData = [], initialPagination }: AnalyticsTableProps) {
  const [data, setData] = useState<ToolAnalyticsOverview[]>(initialData)
  const [pagination, setPagination] = useState<PaginationInfo>(
    initialPagination || {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
  )
  const [loading, setLoading] = useState(false)

  // 获取数据的函数
  const fetchData = async (page: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?page=${page}&pageSize=${pagination.pageSize}`)
      if (response.ok) {
        const result = (await response.json()) as {
          data: ToolAnalyticsOverview[]
          pagination?: PaginationInfo
        }
        setData(result.data)
        if (result.pagination) {
          setPagination(result.pagination)
        }
      } else {
        console.error('Failed to fetch analytics data:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 页面变化处理
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(newPage)
    }
  }

  // 分页按钮组件
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-muted-foreground text-sm">
        显示第 {(pagination.page - 1) * pagination.pageSize + 1} -{' '}
        {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条， 共 {pagination.total} 条记录
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={pagination.page === 1 || loading}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1 || loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-1">
          <span className="text-sm">第</span>
          <span className="text-sm font-medium">{pagination.page}</span>
          <span className="text-sm">页，共</span>
          <span className="text-sm font-medium">{pagination.totalPages}</span>
          <span className="text-sm">页</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages || loading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.totalPages)}
          disabled={pagination.page === pagination.totalPages || loading}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>工具访问统计</CardTitle>
        <CardDescription>各工具的访问量统计数据</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>工具名称</TableHead>
                <TableHead className="text-right">总访问量</TableHead>
                <TableHead className="text-right">独立访客</TableHead>
                <TableHead className="text-right">今日访问</TableHead>
                <TableHead className="text-right">昨日访问</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
                      <span className="ml-2">加载中...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                    暂无统计数据
                  </TableCell>
                </TableRow>
              ) : (
                data.map((tool) => (
                  <TableRow key={tool.toolId}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/divination-tools/${tool.toolId}`}
                        className="text-primary hover:text-primary/80"
                        target="_blank"
                      >
                        {tool.toolName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{tool.totalVisits.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{tool.uniqueVisitors.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className={tool.todayVisits > 0 ? 'text-green-600' : ''}>
                        {tool.todayVisits.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{tool.yesterdayVisits.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/analytics/${tool.toolId}`}>
                        <Button variant="outline" size="sm">
                          详细统计
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationControls />

        {/* {pagination.totalPages > 1 &&
         } */}
      </CardContent>
    </Card>
  )
}
