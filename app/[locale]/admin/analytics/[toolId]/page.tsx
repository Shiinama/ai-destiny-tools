import { Suspense } from 'react'

import { getToolDetailedAnalytics, getAnalyticsRecords } from '@/actions/analytics'
import { getToolById } from '@/actions/divination-tools'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from '@/i18n/navigation'
import { formatDate } from '@/lib/utils'

import AnalyticsFilters from './components/analytics-filters'

interface ToolAnalyticsPageProps {
  params: Promise<{
    toolId: string
  }>
  searchParams: Promise<{
    startDate?: string
    endDate?: string
    page?: string
  }>
}

async function ToolAnalyticsDetails({
  toolId,
  startDate,
  endDate
}: {
  toolId: string
  startDate?: string
  endDate?: string
}) {
  const [tool, analytics] = await Promise.all([
    getToolById(toolId),
    getToolDetailedAnalytics(toolId, { startDate, endDate })
  ])

  return (
    <div className="space-y-6">
      {/* 工具信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{tool.name} - 详细统计</span>
            <Link href={`/divination-tools/${toolId}`} target="_blank">
              <Button variant="outline" size="sm">
                查看工具
              </Button>
            </Link>
          </CardTitle>
          <CardDescription>{tool.description}</CardDescription>
        </CardHeader>
      </Card>

      {/* 基础统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总访问量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVisits.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">独立访客</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueVisitors.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均转化率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalVisits > 0
                ? ((analytics.uniqueVisitors / analytics.totalVisits) * 100).toFixed(1) + '%'
                : '0%'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">数据范围</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{startDate && endDate ? `${startDate} 至 ${endDate}` : '全部数据'}</div>
          </CardContent>
        </Card>
      </div>

      {/* 统计图表区域 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 语言统计 */}
        <Card>
          <CardHeader>
            <CardTitle>访问语言分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.languageStats)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([language, count]) => (
                  <div key={language} className="flex items-center justify-between">
                    <span className="text-sm">{language}</span>
                    <span className="text-sm font-medium">{count as number}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 设备统计 */}
        <Card>
          <CardHeader>
            <CardTitle>设备类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.deviceStats)
                .sort(([, a], [, b]) => b - a)
                .map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{device}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 操作系统统计 */}
        <Card>
          <CardHeader>
            <CardTitle>操作系统</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.osStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([os, count]) => (
                  <div key={os} className="flex items-center justify-between">
                    <span className="text-sm">{os}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 浏览器统计 */}
        <Card>
          <CardHeader>
            <CardTitle>浏览器</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.browserStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([browser, count]) => (
                  <div key={browser} className="flex items-center justify-between">
                    <span className="text-sm">{browser}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 来源统计 */}
      <Card>
        <CardHeader>
          <CardTitle>访问来源</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(analytics.referrerStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 12)
              .map(([referrer, count]) => (
                <div key={referrer} className="bg-muted flex items-center justify-between rounded p-2">
                  <span className="truncate text-sm">{referrer}</span>
                  <span className="ml-2 text-sm font-medium">{count}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function AnalyticsRecords({
  toolId,
  startDate,
  endDate,
  page = 1
}: {
  toolId: string
  startDate?: string
  endDate?: string
  page?: number
}) {
  const { records, pagination } = await getAnalyticsRecords({
    toolId,
    startDate,
    endDate,
    page,
    pageSize: 10
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>访问记录</CardTitle>
        <CardDescription>近10条详细的访问记录列表</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>访问时间</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>IP地址</TableHead>
                <TableHead>语言</TableHead>
                <TableHead>设备</TableHead>
                <TableHead>来源</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center">
                    暂无访问记录
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="text-sm">{formatDate(record.visitedAt)}</TableCell>
                    <TableCell className="text-sm">{record.userName || record.userEmail || '匿名用户'}</TableCell>
                    <TableCell className="font-mono text-sm">{record.ipAddress}</TableCell>
                    <TableCell className="text-sm">{record.language || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {[record.deviceType, record.operatingSystem, record.browser].filter(Boolean).join(' / ')}
                    </TableCell>
                    <TableCell className="text-sm">{record.referrerDomain || 'Direct'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <div className="flex gap-2">
              {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((pageNum) => (
                <Link
                  key={pageNum}
                  href={`?page=${pageNum}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`}
                >
                  <Button variant={pageNum === pagination.page ? 'default' : 'outline'} size="sm">
                    {pageNum}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default async function ToolAnalyticsPage({ params, searchParams }: ToolAnalyticsPageProps) {
  const { toolId } = await params
  const { startDate, endDate, page } = await searchParams
  const currentPage = page ? parseInt(page) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">工具统计详情</h1>
        <Link href="/admin/analytics">
          <Button variant="outline">返回概览</Button>
        </Link>
      </div>

      <AnalyticsFilters />

      <Suspense fallback={<div>加载统计数据中...</div>}>
        <ToolAnalyticsDetails toolId={toolId} startDate={startDate} endDate={endDate} />
      </Suspense>

      <Suspense fallback={<div>加载访问记录中...</div>}>
        <AnalyticsRecords toolId={toolId} startDate={startDate} endDate={endDate} page={currentPage} />
      </Suspense>
    </div>
  )
}
