'use server'

import { eq, like, sql, and } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { divinationTools, divinationCategories, ToolStatus } from '@/lib/db/schema'

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

export async function getPaginatedTools({
  page = 1,
  pageSize = 10,
  status,
  search,
  categoryId
}: {
  page?: number
  pageSize?: number
  status?: ToolStatus
  search?: string
  categoryId?: string
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

  const query = db
    .select({
      tools: divinationTools,
      categoryKey: divinationCategories.key
    })
    .from(divinationTools)
    .leftJoin(divinationCategories, eq(divinationTools.categoryId, divinationCategories.id))

  const filteredQuery = conditions.length > 0 ? query.where(and(...conditions)) : query

  const paginatedQuery = filteredQuery.orderBy(divinationTools.display_order).limit(pageSize).offset(offset)

  const countQuery = db.select({ count: sql`count(*)` }).from(divinationTools)

  const countFilteredQuery = conditions.length > 0 ? countQuery.where(and(...conditions)) : countQuery

  const countResult = await countFilteredQuery.execute()
  const totalCount = Number(countResult[0].count)
  const totalPages = Math.ceil(totalCount / pageSize)

  const tools = await paginatedQuery.execute()

  return {
    tools: tools.map((item) => ({
      ...item.tools,
      categoryKey: item.categoryKey
    })),
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      pageSize
    }
  }
}

export async function getToolById(id: string) {
  const db = createDb()
  const result = await db
    .select({
      tool: divinationTools,
      categoryKey: divinationCategories.key
    })
    .from(divinationTools)
    .leftJoin(divinationCategories, eq(divinationTools.categoryId, divinationCategories.id))
    .where(eq(divinationTools.id, id))
    .execute()

  return {
    ...result[0].tool,
    categoryKey: result[0].categoryKey
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
