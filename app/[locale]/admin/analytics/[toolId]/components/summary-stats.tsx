'use client'

import { Loader2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

interface SummaryStatsProps {
  toolId: string
  toolName: string
  totalVisits: number
  uniqueVisitors: number
  lastSyncedAt: Date | null
  hasUnsyncedData: boolean
  unsyncedVisits: number
  unsyncedUniqueVisitors: number
}

export function SummaryStats({
  toolId,
  toolName,
  totalVisits,
  uniqueVisitors,
  lastSyncedAt,
  hasUnsyncedData,
  unsyncedVisits,
  unsyncedUniqueVisitors
}: SummaryStatsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSync = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/analytics/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ toolId })
      })

      const result = (await response.json()) as any

      if (!response.ok) {
        throw new Error(result.error || 'Sync failed')
      }

      if (result.syncedVisits > 0) {
        toast.success(`同步成功！同步了 ${result.syncedVisits} 次访问，${result.syncedUniqueVisitors} 个独立访客`)
        // 刷新页面以显示最新数据
        window.location.reload()
      } else {
        toast.info('没有新数据需要同步')
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error(error instanceof Error ? error.message : '同步失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>历史总访问量统计</span>
          <div className="flex items-center gap-2">
            {hasUnsyncedData && <Badge variant="secondary">有 {unsyncedVisits} 条未同步数据</Badge>}
            <Button
              onClick={handleSync}
              disabled={isLoading}
              size="sm"
              variant={hasUnsyncedData ? 'default' : 'outline'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  同步中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  同步数据
                </>
              )}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {toolName} 的历史总访问量数据
          {lastSyncedAt && <span className="mt-1 block text-xs">最后同步时间: {formatDate(lastSyncedAt)}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">{totalVisits.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">总访问量</div>
            {hasUnsyncedData && <div className="text-xs text-orange-600">(包含 {unsyncedVisits} 条未同步数据)</div>}
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">{uniqueVisitors.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">独立访客数</div>
            {hasUnsyncedData && (
              <div className="text-xs text-orange-600">(包含 {unsyncedUniqueVisitors} 个未同步访客)</div>
            )}
          </div>
        </div>

        {hasUnsyncedData && (
          <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 p-3">
            <div className="text-sm text-orange-800">
              <strong>提示:</strong> 检测到有未同步的访问数据，点击"同步数据"按钮将这些数据合并到历史总统计中。
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
