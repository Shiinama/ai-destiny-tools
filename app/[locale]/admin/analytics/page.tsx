import { Suspense } from 'react'

import { getToolsAnalyticsOverview } from '@/actions/analytics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'

import { AnalyticsTable } from './components/analytics-table'

async function AnalyticsOverview() {
  const result = await getToolsAnalyticsOverview()
  const toolsStats = result.data

  // 计算总体统计
  const totalStats = toolsStats.reduce(
    (acc, tool) => ({
      totalVisits: acc.totalVisits + tool.totalVisits,
      uniqueVisitors: acc.uniqueVisitors + tool.uniqueVisitors,
      todayVisits: acc.todayVisits + tool.todayVisits,
      yesterdayVisits: acc.yesterdayVisits + tool.yesterdayVisits
    }),
    { totalVisits: 0, uniqueVisitors: 0, todayVisits: 0, yesterdayVisits: 0 }
  )

  return (
    <div className="space-y-6">
      {/* 总体统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总访问量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalVisits.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">累计访问次数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">独立访客</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.uniqueVisitors.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">累计独立访客</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日访问</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.todayVisits.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">今日访问次数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">昨日访问</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.yesterdayVisits.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">昨日访问次数</p>
          </CardContent>
        </Card>
      </div>

      {/* 工具统计表格 */}
      <AnalyticsTable
        initialData={toolsStats.slice(0, 10)}
        initialPagination={{
          page: 1,
          pageSize: 10,
          total: toolsStats.length,
          totalPages: Math.ceil(toolsStats.length / 10)
        }}
      />
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">所有工具-历史总数据统计</h1>
        <Link href="/admin/analytics/data-management">
          <Button variant="outline">数据管理</Button>
        </Link>
      </div>

      <Suspense fallback={<div>加载中...</div>}>
        <AnalyticsOverview />
      </Suspense>
    </div>
  )
}
