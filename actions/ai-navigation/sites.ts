'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { aiSites, aiCategories } from '@/lib/db/schema'

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

    await db.insert(aiSites).values({
      name,
      userId: u?.user?.id,
      description,
      url,
      imageUrl,
      categoryId
    })

    revalidatePath('/admin/ai-navigation')
    return { success: true, message: '站点创建成功' }
  } catch (error) {
    console.error('Error creating site:', error)
    return { success: false, message: '创建站点失败' }
  }
}

export async function getSites() {
  const db = createDb()
  try {
    const sites = await db
      .select({
        id: aiSites.id,
        name: aiSites.name,
        description: aiSites.description,
        url: aiSites.url,
        imageUrl: aiSites.imageUrl,
        categoryId: aiSites.categoryId,
        categoryName: aiCategories.name,
        createdAt: aiSites.createdAt
      })
      .from(aiSites)
      .leftJoin(aiCategories, eq(aiSites.categoryId, aiCategories.id))

    return { success: true, data: sites }
  } catch (error) {
    console.error('Error fetching sites:', error)
    return { success: false, message: '获取站点失败', data: [] }
  }
}

export async function getSitesByCategory(categoryId: string) {
  const db = createDb()
  try {
    const sites = await db.select().from(aiSites).where(eq(aiSites.categoryId, categoryId))

    return { success: true, data: sites }
  } catch (error) {
    console.error('Error fetching sites by category:', error)
    return { success: false, message: '获取分类站点失败', data: [] }
  }
}
