'use server'

import { createDb } from '@/lib/db'
import { aiCategories } from '@/lib/db/schema'

export async function getCategories() {
  const db = createDb()
  const categories = await db
    .select({
      id: aiCategories.id,
      name: aiCategories.name
    })
    .from(aiCategories)
    .orderBy(aiCategories.order)

  return { success: true, data: categories }
}
