import { and, count, desc, eq, gte, lte, sql, like } from 'drizzle-orm'

import { checkUserIsAdmin } from '@/hooks/use-is-admin'
import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { toolAnalytics, toolAnalyticsSummary, divinationTools, users } from '@/lib/db/schema'

export interface AnalyticsFilters {
  toolId?: string
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  country?: string
  deviceType?: string
  page?: number
  pageSize?: number
}

export interface ToolAnalyticsOverview {
  toolId: string
  toolName: string
  totalVisits: number
  uniqueVisitors: number
  todayVisits: number
  yesterdayVisits: number
}

export interface ToolSummaryStats {
  toolId: string
  toolName: string
  totalVisits: number
  uniqueVisitors: number
  lastSyncedAt: Date | null
  hasUnsyncedData: boolean
  unsyncedVisits: number
  unsyncedUniqueVisitors: number
}

export interface DetailedAnalytics {
  totalVisits: number
  uniqueVisitors: number
  languageStats: Record<string, number>
  deviceStats: Record<string, number>
  osStats: Record<string, number>
  browserStats: Record<string, number>
  referrerStats: Record<string, number>
}

// 检查用户是否为管理员
async function checkAdminAccess() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const isAdmin = await checkUserIsAdmin(session.user.id)
  if (!isAdmin) {
    throw new Error('Admin access required')
  }

  return session.user.id
}

// 获取所有工具的统计概览（总访问量来自汇总表+未同步数据，今日昨日数据查询所有数据）
export async function getToolsAnalyticsOverview(
  page?: number,
  pageSize?: number,
  searchQuery?: string
): Promise<{
  data: ToolAnalyticsOverview[]
  pagination?: { page: number; pageSize: number; total: number; totalPages: number }
}> {
  await checkAdminAccess()

  const db = createDb()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // 构建查询条件
  const conditions = [eq(divinationTools.status, 'approved')]

  // 如果有搜索查询，添加模糊搜索条件
  if (searchQuery && searchQuery.trim()) {
    conditions.push(like(divinationTools.name, `%${searchQuery.trim()}%`))
  }

  const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0]

  // 如果有分页参数，先获取总数
  let totalCount = 0
  let pagination = undefined

  if (page && pageSize) {
    const countResult = await db
      .select({ count: count(divinationTools.id) })
      .from(divinationTools)
      .where(whereCondition)

    totalCount = countResult[0]?.count || 0
    pagination = {
      page,
      pageSize,
      total: totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    }
  }

  // 获取工具的基本信息
  const baseQuery = db
    .select({
      toolId: divinationTools.id,
      toolName: divinationTools.name
    })
    .from(divinationTools)
    .where(whereCondition)
    .orderBy(divinationTools.name)

  // 如果有分页参数，添加分页
  const tools = page && pageSize ? await baseQuery.limit(pageSize).offset((page - 1) * pageSize) : await baseQuery

  // 获取今日访问量（查询所有数据）
  const todayStats = await db
    .select({
      toolId: toolAnalytics.toolId,
      todayVisits: count(toolAnalytics.id)
    })
    .from(toolAnalytics)
    .where(gte(toolAnalytics.visitedAt, new Date(today)))
    .groupBy(toolAnalytics.toolId)

  // 获取昨日访问量（查询所有数据）
  const yesterdayStats = await db
    .select({
      toolId: toolAnalytics.toolId,
      yesterdayVisits: count(toolAnalytics.id)
    })
    .from(toolAnalytics)
    .where(
      and(
        gte(toolAnalytics.visitedAt, new Date(yesterday)),
        lte(toolAnalytics.visitedAt, new Date(yesterday + ' 23:59:59'))
      )
    )
    .groupBy(toolAnalytics.toolId)

  // 为每个工具获取总访问量（汇总数据 + 未同步数据）
  const data = await Promise.all(
    tools.map(async (tool) => {
      // 获取汇总统计数据
      const summaryStats = await db
        .select()
        .from(toolAnalyticsSummary)
        .where(eq(toolAnalyticsSummary.toolId, tool.toolId))
        .limit(1)

      // 获取未同步的统计数据
      const unsyncedStats = await db
        .select({
          totalVisits: count(toolAnalytics.id),
          uniqueVisitors: sql<number>`COUNT(DISTINCT ${toolAnalytics.sessionId})`
        })
        .from(toolAnalytics)
        .where(and(eq(toolAnalytics.toolId, tool.toolId), eq(toolAnalytics.isSynced, false)))

      const summary = summaryStats[0]
      const unsynced = unsyncedStats[0] || { totalVisits: 0, uniqueVisitors: 0 }
      const todayStat = todayStats.find((s) => s.toolId === tool.toolId)
      const yesterdayStat = yesterdayStats.find((s) => s.toolId === tool.toolId)

      return {
        toolId: tool.toolId,
        toolName: tool.toolName,
        totalVisits: (summary?.totalVisits || 0) + unsynced.totalVisits,
        uniqueVisitors: (summary?.uniqueVisitors || 0) + unsynced.uniqueVisitors,
        todayVisits: todayStat?.todayVisits || 0,
        yesterdayVisits: yesterdayStat?.yesterdayVisits || 0
      }
    })
  )

  // 按总访问量排序
  data.sort((a, b) => b.totalVisits - a.totalVisits)

  return {
    data,
    pagination
  }
}

// 获取工具的汇总统计数据（包含历史总访问量和未同步数据）
export async function getToolSummaryStats(toolId: string): Promise<ToolSummaryStats> {
  await checkAdminAccess()

  const db = createDb()

  // 获取工具基本信息
  const tool = await db
    .select({ id: divinationTools.id, name: divinationTools.name })
    .from(divinationTools)
    .where(eq(divinationTools.id, toolId))
    .limit(1)

  if (tool.length === 0) {
    throw new Error('Tool not found')
  }

  // 获取汇总统计数据
  const summaryStats = await db
    .select()
    .from(toolAnalyticsSummary)
    .where(eq(toolAnalyticsSummary.toolId, toolId))
    .limit(1)

  // 获取未同步的统计数据
  const unsyncedStats = await db
    .select({
      totalVisits: count(toolAnalytics.id),
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${toolAnalytics.sessionId})`
    })
    .from(toolAnalytics)
    .where(and(eq(toolAnalytics.toolId, toolId), eq(toolAnalytics.isSynced, false)))

  const summary = summaryStats[0]
  const unsynced = unsyncedStats[0] || { totalVisits: 0, uniqueVisitors: 0 }

  return {
    toolId,
    toolName: tool[0].name,
    totalVisits: (summary?.totalVisits || 0) + unsynced.totalVisits,
    uniqueVisitors: (summary?.uniqueVisitors || 0) + unsynced.uniqueVisitors,
    lastSyncedAt: summary?.lastSyncedAt || null,
    hasUnsyncedData: unsynced.totalVisits > 0,
    unsyncedVisits: unsynced.totalVisits,
    unsyncedUniqueVisitors: unsynced.uniqueVisitors
  }
}

// 获取单个工具的详细统计数据（默认查询所有数据，有查询条件时才限制）
export async function getToolDetailedAnalytics(
  toolId: string,
  filters: AnalyticsFilters = {}
): Promise<DetailedAnalytics> {
  await checkAdminAccess()

  const db = createDb()
  const { startDate, endDate } = filters

  // 构建查询条件
  const conditions = [eq(toolAnalytics.toolId, toolId)]

  // 只有在用户明确提供了日期条件时才添加日期限制
  if (startDate) {
    conditions.push(gte(toolAnalytics.visitedAt, new Date(startDate)))
  }

  if (endDate) {
    conditions.push(lte(toolAnalytics.visitedAt, new Date(endDate + ' 23:59:59')))
  }

  const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0]

  // 获取基础统计数据
  const basicStats = await db
    .select({
      totalVisits: count(toolAnalytics.id),
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${toolAnalytics.sessionId})`
    })
    .from(toolAnalytics)
    .where(whereCondition)

  // 获取语言统计
  const languageStats = await db
    .select({
      language: toolAnalytics.language,
      count: count(toolAnalytics.id)
    })
    .from(toolAnalytics)
    .where(whereCondition)
    .groupBy(toolAnalytics.language)
    .orderBy(desc(count(toolAnalytics.id)))

  // 获取设备统计
  const deviceStats = await db
    .select({
      deviceType: toolAnalytics.deviceType,
      count: count(toolAnalytics.id)
    })
    .from(toolAnalytics)
    .where(whereCondition)
    .groupBy(toolAnalytics.deviceType)
    .orderBy(desc(count(toolAnalytics.id)))

  // 获取操作系统统计
  const osStats = await db
    .select({
      os: toolAnalytics.operatingSystem,
      count: count(toolAnalytics.id)
    })
    .from(toolAnalytics)
    .where(whereCondition)
    .groupBy(toolAnalytics.operatingSystem)
    .orderBy(desc(count(toolAnalytics.id)))

  // 获取浏览器统计
  const browserStats = await db
    .select({
      browser: toolAnalytics.browser,
      count: count(toolAnalytics.id)
    })
    .from(toolAnalytics)
    .where(whereCondition)
    .groupBy(toolAnalytics.browser)
    .orderBy(desc(count(toolAnalytics.id)))

  // 获取来源统计
  const referrerStats = await db
    .select({
      referrerDomain: toolAnalytics.referrerDomain,
      count: count(toolAnalytics.id)
    })
    .from(toolAnalytics)
    .where(whereCondition)
    .groupBy(toolAnalytics.referrerDomain)
    .orderBy(desc(count(toolAnalytics.id)))

  return {
    totalVisits: basicStats[0]?.totalVisits || 0,
    uniqueVisitors: basicStats[0]?.uniqueVisitors || 0,
    languageStats: Object.fromEntries(languageStats.map((s) => [s.language || 'Unknown', s.count])),
    deviceStats: Object.fromEntries(deviceStats.map((s) => [s.deviceType || 'Unknown', s.count])),
    osStats: Object.fromEntries(osStats.map((s) => [s.os || 'Unknown', s.count])),
    browserStats: Object.fromEntries(browserStats.map((s) => [s.browser || 'Unknown', s.count])),
    referrerStats: Object.fromEntries(referrerStats.map((s) => [s.referrerDomain || 'Direct', s.count]))
  }
}

// 获取分页的访问记录（默认查询所有数据，有查询条件时才限制）
export async function getAnalyticsRecords(filters: AnalyticsFilters = {}) {
  await checkAdminAccess()

  const db = createDb()
  const { toolId, startDate, endDate, page = 1, pageSize = 50 } = filters

  // 构建查询条件
  const conditions = []

  if (toolId) {
    conditions.push(eq(toolAnalytics.toolId, toolId))
  }

  // 只有在用户明确提供了日期条件时才添加日期限制
  if (startDate) {
    conditions.push(gte(toolAnalytics.visitedAt, new Date(startDate)))
  }

  if (endDate) {
    conditions.push(lte(toolAnalytics.visitedAt, new Date(endDate + ' 23:59:59')))
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

  // 获取记录
  const records = await db
    .select({
      id: toolAnalytics.id,
      toolName: divinationTools.name,
      userName: users.name,
      userEmail: users.email,
      ipAddress: toolAnalytics.ipAddress,
      language: toolAnalytics.language,
      deviceType: toolAnalytics.deviceType,
      operatingSystem: toolAnalytics.operatingSystem,
      browser: toolAnalytics.browser,
      referrerDomain: toolAnalytics.referrerDomain,
      visitedAt: toolAnalytics.visitedAt
    })
    .from(toolAnalytics)
    .leftJoin(divinationTools, eq(toolAnalytics.toolId, divinationTools.id))
    .leftJoin(users, eq(toolAnalytics.userId, users.id))
    .where(whereCondition)
    .orderBy(desc(toolAnalytics.visitedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  // 获取总数
  const totalCount = await db
    .select({ count: count(toolAnalytics.id) })
    .from(toolAnalytics)
    .where(whereCondition)

  return {
    records,
    pagination: {
      page,
      pageSize,
      total: totalCount[0]?.count || 0,
      totalPages: Math.ceil((totalCount[0]?.count || 0) / pageSize)
    }
  }
}
