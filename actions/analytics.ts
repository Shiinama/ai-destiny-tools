import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'

import { checkUserIsAdmin } from '@/hooks/use-is-admin'
import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { toolAnalytics, divinationTools, users } from '@/lib/db/schema'

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

// 获取所有工具的统计概览
export async function getToolsAnalyticsOverview(
  page?: number,
  pageSize?: number
): Promise<{
  data: ToolAnalyticsOverview[]
  pagination?: { page: number; pageSize: number; total: number; totalPages: number }
}> {
  await checkAdminAccess()

  const db = createDb()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // 如果有分页参数，先获取总数
  let totalCount = 0
  let pagination = undefined

  if (page && pageSize) {
    const countResult = await db
      .select({ count: count(divinationTools.id) })
      .from(divinationTools)
      .where(eq(divinationTools.status, 'approved'))

    totalCount = countResult[0]?.count || 0
    pagination = {
      page,
      pageSize,
      total: totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    }
  }

  // 获取工具的基本信息和总访问量
  const baseQuery = db
    .select({
      toolId: divinationTools.id,
      toolName: divinationTools.name,
      totalVisits: count(toolAnalytics.id),
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${toolAnalytics.sessionId})`
    })
    .from(divinationTools)
    .leftJoin(toolAnalytics, eq(divinationTools.id, toolAnalytics.toolId))
    .where(eq(divinationTools.status, 'approved'))
    .groupBy(divinationTools.id, divinationTools.name)
    .orderBy(desc(count(toolAnalytics.id)))

  // 如果有分页参数，添加分页
  const toolsWithStats =
    page && pageSize ? await baseQuery.limit(pageSize).offset((page - 1) * pageSize) : await baseQuery

  // 获取今日访问量
  const todayStats = await db
    .select({
      toolId: toolAnalytics.toolId,
      todayVisits: count(toolAnalytics.id)
    })
    .from(toolAnalytics)
    .where(gte(toolAnalytics.visitedAt, new Date(today)))
    .groupBy(toolAnalytics.toolId)

  // 获取昨日访问量
  const yesterdayStats = await db
    .select({
      toolId: toolAnalytics.toolId,
      yesterdayVisits: count(toolAnalytics.id)
    })
    .from(toolAnalytics)
    .where(and(gte(toolAnalytics.visitedAt, new Date(yesterday)), lte(toolAnalytics.visitedAt, new Date(today))))
    .groupBy(toolAnalytics.toolId)

  // 合并数据
  const data = toolsWithStats.map((tool) => {
    const todayStat = todayStats.find((s) => s.toolId === tool.toolId)
    const yesterdayStat = yesterdayStats.find((s) => s.toolId === tool.toolId)

    return {
      toolId: tool.toolId,
      toolName: tool.toolName,
      totalVisits: tool.totalVisits || 0,
      uniqueVisitors: tool.uniqueVisitors || 0,
      todayVisits: todayStat?.todayVisits || 0,
      yesterdayVisits: yesterdayStat?.yesterdayVisits || 0
    }
  })

  return {
    data,
    pagination
  }
}

// 获取单个工具的详细统计数据
export async function getToolDetailedAnalytics(
  toolId: string,
  filters: AnalyticsFilters = {}
): Promise<DetailedAnalytics> {
  await checkAdminAccess()

  const db = createDb()
  const { startDate, endDate } = filters

  // 构建查询条件
  const conditions = [eq(toolAnalytics.toolId, toolId)]

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

// 获取分页的访问记录
export async function getAnalyticsRecords(filters: AnalyticsFilters = {}) {
  await checkAdminAccess()

  const db = createDb()
  const { toolId, startDate, endDate, page = 1, pageSize = 50 } = filters

  // 构建查询条件
  const conditions = []

  if (toolId) {
    conditions.push(eq(toolAnalytics.toolId, toolId))
  }
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
