import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import { toolSimilarwebData } from '@/lib/db/schema'
import { SimilarWebResponse } from '@/lib/similarweb'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { toolId: string; similarWebData: SimilarWebResponse }
    const { toolId, similarWebData } = body
    //  移除多个字段
    const { Version, Description, SnapshotDate, Countries, ...restData } = similarWebData
    if (!toolId) {
      return NextResponse.json({ error: '缺少必要参数: toolId ' }, { status: 400 })
    }

    const db = createDb()

    const existingData = await db
      .select()
      .from(toolSimilarwebData)
      .where(eq(toolSimilarwebData.toolId, toolId))
      .limit(1)

    if (existingData.length > 0) {
      await db
        .update(toolSimilarwebData)
        .set({
          similarwebData: restData,
          updatedAt: new Date()
        })
        .where(eq(toolSimilarwebData.toolId, toolId))
    } else {
      await db.insert(toolSimilarwebData).values({
        toolId,
        similarwebData: restData
      })
    }

    return NextResponse.json({
      success: true,
      toolId,
      message: 'SimilarWeb 数据已成功存储'
    })
  } catch (error) {
    console.error('保存 SimilarWeb 数据失败:', error)
    return NextResponse.json({ error: '处理请求时出错' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('toolId')

    if (!toolId) {
      return NextResponse.json({ error: '缺少 toolId 参数' }, { status: 400 })
    }

    const db = createDb()
    const data = await db.select().from(toolSimilarwebData).where(eq(toolSimilarwebData.toolId, toolId)).limit(1)

    if (data.length === 0) {
      return NextResponse.json({ error: '未找到该工具的 SimilarWeb 数据' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      toolId,
      data: data[0]
    })
  } catch (error) {
    return NextResponse.json({ error: '获取数据时出错' }, { status: 500 })
  }
}
