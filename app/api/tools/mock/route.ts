import { NextResponse } from 'next/server'

import { createTool, getCategories } from '@/actions/divination-tools'

import type { ToolStatus } from '@/lib/db/schema'

// mock工具数据生成函数，categoryIds参数用于分配真实分类
function generateMockTools(categoryIds: string[]) {
  return Array.from({ length: 10 }).map((_, i) => ({
    name: `Mock Tool ${i + 1}`,
    description: `这是第${i + 1}个模拟工具的描述。`,
    url: `https://mocktool${i + 1}.com`,
    categoryId: categoryIds[i % categoryIds.length] || '',
    contactInfo: `contact${i + 1}@mock.com`,
    isFree: i % 2 === 0,
    price: i % 2 === 0 ? '' : `¥${(i + 1) * 10}/月`,
    content: `Mock Tool ${i + 1} 的详细内容。`,
    logoUrl: '',
    imageUrl: '',
    screenshotUrls: '',
    status: 'approved' as ToolStatus,
    platform: 'web'
  }))
}

export async function GET() {
  // 只在本地环境允许调用
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ code: 403, message: '此接口仅在开发环境可用' }, { status: 403 })
  }
  // 获取真实分类
  const categories = await getCategories()
  const categoryIds = categories.map((c: any) => c.id)
  const mockTools = generateMockTools(categoryIds)
  // 依次保存mock工具到数据库
  const results = []
  for (const tool of mockTools) {
    try {
      const saved = await createTool(tool)
      results.push({ success: true, id: saved.id })
    } catch (err) {
      results.push({ success: false, error: String(err) })
    }
  }
  return NextResponse.json({ code: 0, data: results })
}
