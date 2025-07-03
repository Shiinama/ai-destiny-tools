import { existsSync } from 'fs'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

import { NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import { posts } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = createDb()
    const pageSize = 100
    let page = 1
    let hasMore = true
    const allPosts = []

    while (hasMore) {
      const offset = (page - 1) * pageSize
      const posts_data = await db
        .select({
          id: posts.id,
          slug: posts.slug,
          locale: posts.locale,
          publishedAt: posts.publishedAt
        })
        .from(posts)
        .limit(pageSize)
        .offset(offset)

      if (posts_data.length < pageSize) {
        hasMore = false
      }

      allPosts.push(...posts_data)
      page++
    }

    // 检查并创建目录
    const filePath = join(process.cwd(), 'app', 'allArticles.json')
    const dirPath = join(process.cwd(), 'app')

    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true })
    }

    // 写入文件
    await writeFile(filePath, JSON.stringify(allPosts, null, 2))

    return NextResponse.json({
      total: allPosts.length,
      message: `成功获取并写入 ${allPosts.length} 条文章数据`
    })
  } catch (error) {
    console.error('Error fetching all blog URLs:', error)
    return NextResponse.json({ error: 'Failed to fetch blog URLs' }, { status: 500 })
  }
}
