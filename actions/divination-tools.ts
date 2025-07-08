'use server'

import { eq, like, sql, and } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { divinationTools, divinationCategories, ToolStatus, divinationToolTranslations } from '@/lib/db/schema'

export type DivinationToolInput = {
  name: string
  description: string
  url: string
  imageUrl: string
  categoryId: string
  content?: string
  platform?: string
  isFree?: boolean
  status: ToolStatus
  price?: string
  contactInfo?: string
  logoUrl?: string
  screenshotUrls?: string
}

export type DivinationToolUpdateInput = DivinationToolInput & {
  status?: ToolStatus
}

// 多语言字段处理工具函数
function withI18nFields<T extends { description: string; content: string }>(
  base: T,
  translation?: { content?: string | null; description?: string | null },
  locale?: string
) {
  if (!locale || locale === 'en' || !translation) {
    return base
  }
  return {
    ...base,
    content: translation.content || base.content,
    description: translation.description || base.description
  }
}

export async function getPaginatedTools({
  page = 1,
  pageSize = 10,
  status,
  search,
  categoryId,
  locale
}: {
  page?: number
  pageSize?: number
  status?: ToolStatus
  search?: string
  categoryId?: string
  locale?: string
}) {
  const offset = (page - 1) * pageSize
  const db = createDb()

  const conditions = []

  if (status) {
    conditions.push(eq(divinationTools.status, status))
  }

  if (search) {
    conditions.push(like(divinationTools.name, `%${search}%`))
  }

  if (categoryId) {
    conditions.push(eq(divinationTools.categoryId, categoryId))
  }

  let query
  if (!locale || locale === 'en') {
    query = db
      .select({
        tools: divinationTools,
        categoryKey: divinationCategories.key
      })
      .from(divinationTools)
      .leftJoin(divinationCategories, eq(divinationTools.categoryId, divinationCategories.id))
  } else {
    query = db
      .select({
        tools: divinationTools,
        categoryKey: divinationCategories.key,
        translationContent: divinationToolTranslations.content,
        translationDescription: divinationToolTranslations.description
      })
      .from(divinationTools)
      .leftJoin(divinationCategories, eq(divinationTools.categoryId, divinationCategories.id))
      .leftJoin(
        divinationToolTranslations,
        and(eq(divinationToolTranslations.toolId, divinationTools.id), eq(divinationToolTranslations.locale, locale))
      )
  }

  const filteredQuery = conditions.length > 0 ? query.where(and(...conditions)) : query

  const paginatedQuery = filteredQuery.orderBy(divinationTools.display_order).limit(pageSize).offset(offset)

  const countQuery = db.select({ count: sql`count(*)` }).from(divinationTools)

  const countFilteredQuery = conditions.length > 0 ? countQuery.where(and(...conditions)) : countQuery

  const countResult = await countFilteredQuery.execute()
  const totalCount = Number(countResult[0].count)
  const totalPages = Math.ceil(totalCount / pageSize)

  const tools = await paginatedQuery.execute()

  return {
    tools: tools.map((item) => {
      return {
        ...withI18nFields(
          { ...item.tools, content: item.tools.content ?? '' },
          'translationContent' in item || 'translationDescription' in item
            ? { content: (item as any).translationContent, description: (item as any).translationDescription }
            : undefined,
          locale
        ),
        categoryKey: item.categoryKey
      }
    }),
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      pageSize
    }
  }
}

export async function getToolById(id: string, locale?: string) {
  const db = createDb()
  let query
  if (!locale || locale === 'en') {
    query = db
      .select({
        tool: divinationTools,
        categoryKey: divinationCategories.key
      })
      .from(divinationTools)
      .leftJoin(divinationCategories, eq(divinationTools.categoryId, divinationCategories.id))
      .where(eq(divinationTools.id, id))
  } else {
    query = db
      .select({
        tool: divinationTools,
        categoryKey: divinationCategories.key,
        translationContent: divinationToolTranslations.content,
        translationDescription: divinationToolTranslations.description
      })
      .from(divinationTools)
      .leftJoin(divinationCategories, eq(divinationTools.categoryId, divinationCategories.id))
      .leftJoin(
        divinationToolTranslations,
        and(eq(divinationToolTranslations.toolId, divinationTools.id), eq(divinationToolTranslations.locale, locale))
      )
      .where(eq(divinationTools.id, id))
  }
  const result = await query.execute()

  const item = result[0]

  return {
    ...withI18nFields(
      { ...item.tool, content: item.tool.content ?? '' },
      'translationContent' in item || 'translationDescription' in item
        ? { content: (item as any).translationContent, description: (item as any).translationDescription }
        : undefined,
      locale
    ),
    categoryKey: item.categoryKey
  }
}

export async function createTool(data: DivinationToolInput) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const db = createDb()

  const result = await db
    .insert(divinationTools)
    .values({
      ...data,
      userId: session.user.id
    })
    .returning()
    .execute()

  return result[0]
}

export async function updateTool(id: string, data: DivinationToolUpdateInput) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const db = createDb()

  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_ID.split(',').includes(session.user.id)

  if (!isAdmin) {
    const tool = await db.select().from(divinationTools).where(eq(divinationTools.id, id)).execute()

    if (tool.length === 0 || tool[0].userId !== session.user.id) {
      throw new Error('Unauthorized')
    }
  }

  const result = await db.update(divinationTools).set(data).where(eq(divinationTools.id, id)).returning().execute()

  return result[0]
}

export async function updateToolStatus(id: string, status: ToolStatus) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_ID.split(',').includes(session.user.id)
  if (!isAdmin) {
    throw new Error('Unauthorized')
  }

  const db = createDb()

  const result = await db
    .update(divinationTools)
    .set({ status })
    .where(eq(divinationTools.id, id))
    .returning()
    .execute()

  return result[0]
}

export async function batchUpdateToolOrder(updates: Array<{ id: string; order: number }>) {
  const db = createDb()
  const results = []

  const batchSize = 10
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)

    const updatePromises = batch.map(async ({ id, order }) => {
      try {
        const result = await db
          .update(divinationTools)
          .set({ display_order: order })
          .where(eq(divinationTools.id, id))
          .returning()
          .execute()

        return result[0]
      } catch (error) {
        console.error(`Failed to update tool ${id}:`, error)
        return null
      }
    })

    const batchResults = await Promise.all(updatePromises)
    results.push(...batchResults.filter(Boolean))
  }

  return results
}

export async function updateToolOrder(id: string, newOrder: number) {
  const db = createDb()

  const result = await db
    .update(divinationTools)
    .set({ display_order: newOrder })
    .where(eq(divinationTools.id, id))
    .returning()
    .execute()

  return result[0]
}

export async function updateToolsOrder(items: Array<{ id: string; index: number }>) {
  const db = createDb()

  const results = await Promise.all(
    items.map(async ({ id, index }) => {
      try {
        const result = await db
          .update(divinationTools)
          .set({ display_order: index })
          .where(eq(divinationTools.id, id))
          .returning()
          .execute()

        return result[0]
      } catch (error) {
        console.error(`Failed to update tool ${id}:`, error)
        return null
      }
    })
  )

  return results.filter(Boolean)
}

export async function deleteTool(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const db = createDb()

  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_ID.split(',').includes(session.user.id)

  if (!isAdmin) {
    const tool = await db.select().from(divinationTools).where(eq(divinationTools.id, id)).execute()

    if (tool.length === 0 || tool[0].userId !== session.user.id) {
      throw new Error('Unauthorized')
    }
  }

  await db.delete(divinationTools).where(eq(divinationTools.id, id)).execute()
}

export async function getCategories() {
  const db = createDb()
  return db.select().from(divinationCategories).orderBy(divinationCategories.display_order).execute()
}

// 新增或更新多语言翻译
export async function upsertToolTranslations(
  toolId: string,
  translations: Array<{ locale: string; content: string; description: string }>
) {
  const db = createDb()
  try {
    for (const { locale, content, description } of translations) {
      // 先查，有则更新，无则插入
      const exist = await db
        .select()
        .from(divinationToolTranslations)
        .where(and(eq(divinationToolTranslations.toolId, toolId), eq(divinationToolTranslations.locale, locale)))
        .execute()
      if (exist.length > 0) {
        await db
          .update(divinationToolTranslations)
          .set({ content, description, updatedAt: new Date() })
          .where(and(eq(divinationToolTranslations.toolId, toolId), eq(divinationToolTranslations.locale, locale)))
          .execute()
      } else {
        await db
          .insert(divinationToolTranslations)
          .values({ toolId, locale, content, description, createdAt: new Date(), updatedAt: new Date() })
          .execute()
      }
    }
    return { code: 0, message: '多语言翻译已全部同步完成' }
  } catch (error) {
    return { code: 1, message: '多语言翻译同步失败', error: error instanceof Error ? error.message : String(error) }
  }
}

// 获取所有工具（仅返回 id、name、description 字段）
export async function getAllTools(page?: number, pageSize?: number) {
  const db = createDb()
  const query = db
    .select({
      id: divinationTools.id,
      content: divinationTools.content,
      description: divinationTools.description
    })
    .from(divinationTools)
    .orderBy(divinationTools.display_order)

  if (page !== undefined && pageSize !== undefined) {
    const dynamicQuery = query
      .$dynamic()
      .limit(pageSize)
      .offset((page - 1) * pageSize)
    return dynamicQuery.execute()
  }
  return query.execute()
}
