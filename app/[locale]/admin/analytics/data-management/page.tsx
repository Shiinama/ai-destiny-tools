'use client'

import { Loader2, Trash2, RefreshCw, Database, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'

interface CleanupStats {
  totalRecords: number
  recentRecords: number
  oldRecords: number
  unsyncedOldRecords: number
  summaryToolsCount: number
  cutoffDate: string
  canCleanup: boolean
}

export default function DataManagementPage() {
  const [stats, setStats] = useState<CleanupStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  // const [isGeneratingTestData, setIsGeneratingTestData] = useState(false)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/analytics/cleanup')
      const data = (await response.json()) as any

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats')
      }

      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('获取统计信息失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncAll = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/admin/analytics/sync', {
        method: 'PUT'
      })

      const result = (await response.json()) as any

      if (!response.ok) {
        throw new Error(result.error || 'Sync failed')
      }

      toast.success(`同步成功！同步了 ${result.results.length} 个工具的数据`)
      await fetchStats() // 刷新统计信息
    } catch (error) {
      console.error('Sync error:', error)
      toast.error(error instanceof Error ? error.message : '同步失败')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCleanup = async () => {
    setIsCleaningUp(true)
    try {
      const response = await fetch('/api/admin/analytics/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ forceCleanup: true })
      })

      const result = (await response.json()) as any

      if (!response.ok) {
        throw new Error(result.error || 'Cleanup failed')
      }

      toast.success(`清理成功！删除了 ${result.cleanedRecords} 条旧记录`)
      await fetchStats() // 刷新统计信息
    } catch (error) {
      console.error('Cleanup error:', error)
      toast.error(error instanceof Error ? error.message : '清理失败')
    } finally {
      setIsCleaningUp(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // const handleGenerateTestData = async () => {
  //   setIsGeneratingTestData(true)
  //   try {
  //     const response = await fetch('/api/admin/analytics/generate-test-data', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ count: 10000 })
  //     })

  //     const result = (await response.json()) as any

  //     if (!response.ok) {
  //       throw new Error(result.error || 'Failed to generate test data')
  //     }

  //     toast.success(`测试数据生成成功！生成了 ${result.generatedCount} 条记录`)
  //     await fetchStats() // 刷新统计信息
  //   } catch (error) {
  //     console.error('Generate test data error:', error)
  //     toast.error(error instanceof Error ? error.message : '生成测试数据失败')
  //   } finally {
  //     setIsGeneratingTestData(false)
  //   }
  // }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">无法加载统计信息</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">数据库中现存统计数据</h1>
        <Link href="/admin/analytics">
          <Button variant="outline">返回分析概览</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总记录数</CardTitle>
            <Database className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最近3个月</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.recentRecords.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">3个月前数据</CardTitle>
            <Database className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.oldRecords.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">汇总工具数</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.summaryToolsCount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            数据同步
          </CardTitle>
          <CardDescription>将所有未同步的访问数据合并到历史总统计中</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">同步所有工具的访问数据到汇总统计表</p>
            </div>
            <Button onClick={handleSyncAll} disabled={isSyncing} variant="default">
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  同步中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  同步所有数据
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            数据清理
          </CardTitle>
          <CardDescription>删除3个月前的详细访问记录（保留汇总统计）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">
                  清理日期：{new Date(stats.cutoffDate).toLocaleDateString('zh-CN')} 之前的数据
                </p>
                <p className="text-muted-foreground text-sm">将删除 {stats.oldRecords.toLocaleString()} 条记录</p>
              </div>
              <div className="flex items-center gap-2">
                {stats.unsyncedOldRecords > 0 && (
                  <Badge variant="destructive">{stats.unsyncedOldRecords} 条未同步</Badge>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={!stats.canCleanup || stats.oldRecords === 0 || isCleaningUp}
                    >
                      {isCleaningUp ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          清理中...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          清理旧数据
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        确认清理数据
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将永久删除 {stats.oldRecords.toLocaleString()} 条3个月前的详细访问记录。
                        汇总统计数据将被保留。此操作不可撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCleanup} className="bg-red-600 hover:bg-red-700">
                        确认清理
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {stats.unsyncedOldRecords > 0 && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <div className="text-sm text-red-800">
                  <strong>警告:</strong> 有 {stats.unsyncedOldRecords} 条旧记录尚未同步。
                  请先同步所有数据，然后再进行清理。
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            测试数据生成
          </CardTitle>
          <CardDescription>生成1000条测试访问数据用于测试和演示</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">
                生成随机的访问记录数据，包含不同时间段、设备类型和地理位置
              </p>
            </div>
            <Button onClick={handleGenerateTestData} disabled={isGeneratingTestData} variant="secondary">
              {isGeneratingTestData ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  生成1000条测试数据
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
