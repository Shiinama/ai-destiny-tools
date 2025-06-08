'use server'

import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { divinationTools, divinationCategories } from '@/lib/db/schema'

export async function createSite(formData: FormData) {
  try {
    const u = await auth()
    if (!u?.user?.id) {
      return { success: false, message: 'Unauthorized', code: 401 }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const url = formData.get('url') as string
    const imageUrl = formData.get('imageUrl') as string
    const categoryId = formData.get('categoryId') as string

    if (!name || !description || !url || !categoryId) {
      return { success: false, message: '请填写所有必填字段' }
    }

    const db = createDb()

    await db.insert(divinationTools).values({
      name,
      userId: u?.user?.id,
      description,
      url,
      imageUrl,
      categoryId
    })

    return { success: true, message: '站点创建成功' }
  } catch (error) {
    console.error('Error creating site:', error)
    return { success: false, message: '创建站点失败' }
  }
}

export async function getSites(categoryId?: string) {
  const db = createDb()
  try {
    const baseQuery = db
      .select({
        id: divinationTools.id,
        name: divinationTools.name,
        description: divinationTools.description,
        url: divinationTools.url,
        imageUrl: divinationTools.imageUrl,
        categoryId: divinationTools.categoryId,
        categoryName: divinationCategories.key,
        createdAt: divinationTools.createdAt
      })
      .from(divinationTools)
      .leftJoin(divinationCategories, eq(divinationTools.categoryId, divinationCategories.id))

    const sites = categoryId ? await baseQuery.where(eq(divinationTools.categoryId, categoryId)) : await baseQuery

    return { success: true, data: sites }
  } catch {
    return { success: false, message: '获取站点失败', data: [] }
  }
}

export async function getSitesByCategory(categoryId: string) {
  const db = createDb()
  try {
    const sites = await db.select().from(divinationTools).where(eq(divinationTools.categoryId, categoryId))

    return { success: true, data: sites }
  } catch (error) {
    console.error('Error fetching sites by category:', error)
    return { success: false, message: '获取分类站点失败', data: [] }
  }
}
