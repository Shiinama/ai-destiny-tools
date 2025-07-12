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
      // eslint-disable-next-line no-console
      console.log(`正在获取第${page}页，offset=${offset}`)
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
      // eslint-disable-next-line no-console
      console.log(`本页获取到${posts_data.length}条数据`)
      if (posts_data.length < pageSize) {
        hasMore = false
        // eslint-disable-next-line no-console
        console.log('已获取全部数据')
      }

      allPosts.push(...posts_data)
      page++
    }

    // 检查并创建目录
    const filePath = join(process.cwd(), 'app', 'allArticles.json')
    const dirPath = join(process.cwd(), 'app')
    // eslint-disable-next-line no-console
    console.log('文件路径:', filePath)

    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true })
      // eslint-disable-next-line no-console
      console.log('目录不存在，已创建')
    }

    // 写入文件
    await writeFile(filePath, JSON.stringify(allPosts, null, 2))
    // eslint-disable-next-line no-console
    console.log('已写入文件')

    return NextResponse.json({
      total: allPosts.length,
      message: `成功获取并写入 ${allPosts.length} 条文章数据`
    })
  } catch (error) {
    console.error('Error fetching all blog URLs:', error)
    return NextResponse.json({ error: 'Failed to fetch blog URLs' }, { status: 500 })
  }
}
