'use server'

import { createDb } from '@/lib/db'
import { divinationCategories } from '@/lib/db/schema'

export async function getCategories() {
  const db = createDb()
  const categories = await db
    .select({
      id: divinationCategories.id,
      key: divinationCategories.key
    })
    .from(divinationCategories)
    .orderBy(divinationCategories.order)

  return { success: true, data: categories }
}
