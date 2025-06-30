'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

export function AnalyticsTable() {
  const [data, setData] = useState<ToolAnalyticsOverview[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 获取数据的函数
  const fetchData = async (page: number, search?: string, pageSize?: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: (pageSize ?? pagination.pageSize).toString()
      })

      if (search && search.trim()) {
        params.set('search', search.trim())
      }

      const response = await fetch(`/api/admin/analytics?${params.toString()}`)
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

  // 组件挂载时自动加载第一页数据
  useEffect(() => {
    fetchData(1, '')
  }, [])

  // 页面变化处理
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(newPage, searchQuery)
    }
  }

  // 搜索处理
  const handleSearch = () => {
    fetchData(1, searchQuery)
  }

  // 重置搜索
  const handleResetSearch = () => {
    setSearchQuery('')
    fetchData(1, '')
  }

  // 分页按钮组件
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center space-x-4">
        <div className="text-muted-foreground text-sm">
          显示第 {(pagination.page - 1) * pagination.pageSize + 1} -{' '}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条， 共 {pagination.total} 条记录
        </div>
        <Select
          value={String(pagination.pageSize)}
          onValueChange={(val) => {
            const newSize = Number(val)
            setPagination((prev) => ({ ...prev, pageSize: newSize, page: 1 }))
            fetchData(1, searchQuery, newSize)
          }}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10条/页</SelectItem>
            <SelectItem value="20">20条/页</SelectItem>
            <SelectItem value="50">50条/页</SelectItem>
          </SelectContent>
        </Select>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>工具访问统计</CardTitle>
            <CardDescription>各工具的访问量统计数据</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索工具名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-64 rounded-md border px-3 py-1 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button onClick={handleSearch} size="sm">
              搜索
            </Button>
            {searchQuery && (
              <Button onClick={handleResetSearch} variant="outline" size="sm">
                重置
              </Button>
            )}
          </div>
        </div>
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
