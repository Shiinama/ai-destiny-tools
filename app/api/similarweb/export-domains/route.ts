import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { createDb } from '../../../../lib/db'
import { divinationTools } from '../../../../lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    const db = createDb()

    // 查询所有已批准工具的 id 和 url
    const tools = await db
      .select({
        id: divinationTools.id,
        url: divinationTools.url
      })
      .from(divinationTools)
      .where(eq(divinationTools.status, 'approved'))

    // 转换为域名映射格式
    const domainMappings = tools.map((tool) => ({
      domain: tool.url,
      toolId: tool.id
    }))

    return NextResponse.json({
      success: true,
      count: domainMappings.length,
      data: domainMappings
    })
  } catch (error) {
    return NextResponse.json({ error: '获取工具域名失败' }, { status: 500 })
  }
}
