import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { createDb } from '../../../lib/db'
import { toolSimilarwebData } from '../../../lib/db/schema'
import { SimilarWebResponse } from '../../../lib/similarweb'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { toolId: string; similarWebData: SimilarWebResponse }
    const { toolId, similarWebData } = body

    if (!toolId || !similarWebData) {
      return NextResponse.json({ error: '缺少必要参数: toolId 和 similarWebData' }, { status: 400 })
    }

    // 验证数据格式
    if (!similarWebData.EstimatedMonthlyVisits || typeof similarWebData.EstimatedMonthlyVisits !== 'object') {
      return NextResponse.json(
        { error: 'SimilarWeb 数据格式不正确，缺少 EstimatedMonthlyVisits 字段' },
        { status: 400 }
      )
    }

    // 存储到数据库
    const db = createDb()
    const estimatedMonthlyVisits = similarWebData.EstimatedMonthlyVisits

    // 检查是否已存在该工具的数据
    const existingData = await db
      .select()
      .from(toolSimilarwebData)
      .where(eq(toolSimilarwebData.toolId, toolId))
      .limit(1)

    if (existingData.length > 0) {
      // 更新现有数据
      await db
        .update(toolSimilarwebData)
        .set({
          similarwebData: estimatedMonthlyVisits,
          updatedAt: new Date()
        })
        .where(eq(toolSimilarwebData.toolId, toolId))
    } else {
      // 插入新数据
      await db.insert(toolSimilarwebData).values({
        toolId,
        similarwebData: estimatedMonthlyVisits
      })
    }

    return NextResponse.json({
      success: true,
      toolId,
      monthlyVisits: estimatedMonthlyVisits,
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

    // 从数据库获取工具的 SimilarWeb 数据
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
