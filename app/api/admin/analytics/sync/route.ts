import { and, count, eq, sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { checkUserIsAdmin } from '@/hooks/use-is-admin'
import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { toolAnalytics, toolAnalyticsSummary, divinationTools } from '@/lib/db/schema'

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

// 同步单个工具的统计数据
export async function POST(request: NextRequest) {
  try {
    await checkAdminAccess()

    const { toolId } = (await request.json()) as any

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
    }

    const db = createDb()

    // 检查工具是否存在
    const tool = await db
      .select({ id: divinationTools.id, name: divinationTools.name })
      .from(divinationTools)
      .where(eq(divinationTools.id, toolId))
      .limit(1)

    if (tool.length === 0) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    // 计算未同步的统计数据
    const unsyncedStats = await db
      .select({
        totalVisits: count(toolAnalytics.id),
        uniqueVisitors: sql<number>`COUNT(DISTINCT ${toolAnalytics.sessionId})`
      })
      .from(toolAnalytics)
      .where(and(eq(toolAnalytics.toolId, toolId), eq(toolAnalytics.isSynced, false)))

    const { totalVisits, uniqueVisitors } = unsyncedStats[0] || { totalVisits: 0, uniqueVisitors: 0 }

    if (totalVisits === 0) {
      return NextResponse.json({
        message: 'No new data to sync',
        toolName: tool[0].name,
        syncedVisits: 0,
        syncedUniqueVisitors: 0
      })
    }

    // 检查是否已存在汇总记录
    const existingSummary = await db
      .select()
      .from(toolAnalyticsSummary)
      .where(eq(toolAnalyticsSummary.toolId, toolId))
      .limit(1)

    const now = new Date()

    if (existingSummary.length > 0) {
      // 更新现有汇总记录
      await db
        .update(toolAnalyticsSummary)
        .set({
          totalVisits: sql`${toolAnalyticsSummary.totalVisits} + ${totalVisits}`,
          uniqueVisitors: sql`${toolAnalyticsSummary.uniqueVisitors} + ${uniqueVisitors}`,
          lastSyncedAt: now,
          updatedAt: now
        })
        .where(eq(toolAnalyticsSummary.toolId, toolId))
    } else {
      // 创建新的汇总记录
      await db.insert(toolAnalyticsSummary).values({
        toolId,
        totalVisits,
        uniqueVisitors,
        lastSyncedAt: now,
        createdAt: now,
        updatedAt: now
      })
    }

    // 标记已同步的记录
    await db
      .update(toolAnalytics)
      .set({ isSynced: true })
      .where(and(eq(toolAnalytics.toolId, toolId), eq(toolAnalytics.isSynced, false)))

    return NextResponse.json({
      success: true,
      message: 'Data synced successfully',
      toolName: tool[0].name,
      syncedVisits: totalVisits,
      syncedUniqueVisitors: uniqueVisitors
    })
  } catch (error) {
    console.error('Sync analytics error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}

// 同步所有工具的统计数据
export async function PUT() {
  try {
    await checkAdminAccess()

    const db = createDb()

    // 获取所有已批准的工具
    const tools = await db
      .select({ id: divinationTools.id, name: divinationTools.name })
      .from(divinationTools)
      .where(eq(divinationTools.status, 'approved'))

    const syncResults = []

    for (const tool of tools) {
      // 计算未同步的统计数据
      const unsyncedStats = await db
        .select({
          totalVisits: count(toolAnalytics.id),
          uniqueVisitors: sql<number>`COUNT(DISTINCT ${toolAnalytics.sessionId})`
        })
        .from(toolAnalytics)
        .where(and(eq(toolAnalytics.toolId, tool.id), eq(toolAnalytics.isSynced, false)))

      const { totalVisits, uniqueVisitors } = unsyncedStats[0] || { totalVisits: 0, uniqueVisitors: 0 }

      if (totalVisits > 0) {
        // 检查是否已存在汇总记录
        const existingSummary = await db
          .select()
          .from(toolAnalyticsSummary)
          .where(eq(toolAnalyticsSummary.toolId, tool.id))
          .limit(1)

        const now = new Date()

        if (existingSummary.length > 0) {
          // 更新现有汇总记录
          await db
            .update(toolAnalyticsSummary)
            .set({
              totalVisits: sql`${toolAnalyticsSummary.totalVisits} + ${totalVisits}`,
              uniqueVisitors: sql`${toolAnalyticsSummary.uniqueVisitors} + ${uniqueVisitors}`,
              lastSyncedAt: now,
              updatedAt: now
            })
            .where(eq(toolAnalyticsSummary.toolId, tool.id))
        } else {
          // 创建新的汇总记录
          await db.insert(toolAnalyticsSummary).values({
            toolId: tool.id,
            totalVisits,
            uniqueVisitors,
            lastSyncedAt: now,
            createdAt: now,
            updatedAt: now
          })
        }

        // 标记已同步的记录
        await db
          .update(toolAnalytics)
          .set({ isSynced: true })
          .where(and(eq(toolAnalytics.toolId, tool.id), eq(toolAnalytics.isSynced, false)))

        syncResults.push({
          toolId: tool.id,
          toolName: tool.name,
          syncedVisits: totalVisits,
          syncedUniqueVisitors: uniqueVisitors
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced data for ${syncResults.length} tools`,
      results: syncResults
    })
  } catch (error) {
    console.error('Bulk sync analytics error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}
