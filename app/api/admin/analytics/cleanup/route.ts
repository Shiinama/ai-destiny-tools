import { and, count, eq, gte, lt } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { checkUserIsAdmin } from '@/hooks/use-is-admin'
import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { toolAnalytics, toolAnalyticsSummary } from '@/lib/db/schema'

// 统一的三个月前日期计算函数
function getThreeMonthsAgo(): Date {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
  return threeMonthsAgo
}

async function checkAdminAccess() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: Please login')
  }

  const isAdmin = await checkUserIsAdmin(session.user.id)
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }
}

// 清理3个月前的数据
export async function POST(request: NextRequest) {
  try {
    await checkAdminAccess()

    const { forceCleanup = false } = (await request.json()) as any

    const db = createDb()

    // 计算3个月前的日期
    const threeMonthsAgo = getThreeMonthsAgo()

    // 首先检查有多少数据需要清理
    const oldDataCount = await db
      .select({ count: count(toolAnalytics.id) })
      .from(toolAnalytics)
      .where(lt(toolAnalytics.visitedAt, threeMonthsAgo))

    const totalOldRecords = oldDataCount[0]?.count || 0

    if (totalOldRecords === 0) {
      return NextResponse.json({
        message: 'No old data to cleanup',
        cleanedRecords: 0
      })
    }

    if (!forceCleanup) {
      // 如果不是强制清理，只返回统计信息
      return NextResponse.json({
        message: `Found ${totalOldRecords} records older than 3 months`,
        oldRecords: totalOldRecords,
        needsConfirmation: true
      })
    }

    // 在删除之前，确保所有旧数据都已同步
    const unsyncedOldData = await db
      .select({ count: count(toolAnalytics.id) })
      .from(toolAnalytics)
      .where(and(lt(toolAnalytics.visitedAt, threeMonthsAgo), eq(toolAnalytics.isSynced, false)))

    const unsyncedCount = unsyncedOldData[0]?.count || 0

    if (unsyncedCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot cleanup: ${unsyncedCount} old records are not synced yet. Please sync all data first.`,
          unsyncedRecords: unsyncedCount
        },
        { status: 400 }
      )
    }

    // 执行清理
    await db.delete(toolAnalytics).where(lt(toolAnalytics.visitedAt, threeMonthsAgo))

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${totalOldRecords} old records`,
      cleanedRecords: totalOldRecords,
      cutoffDate: threeMonthsAgo.toISOString()
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}

// 获取清理统计信息
export async function GET() {
  try {
    await checkAdminAccess()

    const db = createDb()

    // 计算3个月前的日期
    const threeMonthsAgo = getThreeMonthsAgo()

    // 统计总记录数
    const totalRecords = await db.select({ count: count(toolAnalytics.id) }).from(toolAnalytics)

    // 统计3个月内的记录数
    const recentRecords = await db
      .select({ count: count(toolAnalytics.id) })
      .from(toolAnalytics)
      .where(gte(toolAnalytics.visitedAt, threeMonthsAgo))

    // 统计3个月前的记录数
    const oldRecords = await db
      .select({ count: count(toolAnalytics.id) })
      .from(toolAnalytics)
      .where(lt(toolAnalytics.visitedAt, threeMonthsAgo))

    // 统计未同步的旧记录数
    const unsyncedOldRecords = await db
      .select({ count: count(toolAnalytics.id) })
      .from(toolAnalytics)
      .where(and(lt(toolAnalytics.visitedAt, threeMonthsAgo), eq(toolAnalytics.isSynced, false)))

    // 统计汇总表中的工具数量
    const summaryToolsCount = await db.select({ count: count(toolAnalyticsSummary.id) }).from(toolAnalyticsSummary)

    return NextResponse.json({
      totalRecords: totalRecords[0]?.count || 0,
      recentRecords: recentRecords[0]?.count || 0,
      oldRecords: oldRecords[0]?.count || 0,
      unsyncedOldRecords: unsyncedOldRecords[0]?.count || 0,
      summaryToolsCount: summaryToolsCount[0]?.count || 0,
      cutoffDate: threeMonthsAgo.toISOString(),
      canCleanup: (unsyncedOldRecords[0]?.count || 0) === 0
    })
  } catch (error) {
    console.error('Get cleanup stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}
