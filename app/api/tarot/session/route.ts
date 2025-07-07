import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { tarotSessions } from '@/lib/db/schema'

interface CreateSessionRequest {
  question: string
  spreadName: string
  spreadCategory: string
  spreadDesc?: string
  reason?: string
  cardCount: string | number
  spreadLink: string
}

interface UpdateSessionRequest {
  sessionId: string
  cards?: any[]
  aiInterpretation?: string
  status?: string
}

// 创建塔罗牌会话
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const db = createDb()
  const body = (await req.json()) as {
    spreadName: string
    spreadCategory: string
    spreadDesc?: string
    reason?: string
    cardCount: number
    spreadLink?: string
    question: string
  }

  try {
    const [newSession] = await db
      .insert(tarotSessions)
      .values({
        userId: session.user.id,
        spreadName: body.spreadName,
        spreadCategory: body.spreadCategory,
        spreadDesc: body.spreadDesc,
        reason: body.reason,
        cardCount: body.cardCount,
        spreadLink: body.spreadLink,
        question: body.question
      })
      .returning()

    return NextResponse.json({ id: newSession.id }, { status: 201 })
  } catch (error) {
    console.error('创建塔罗牌会话失败:', error)
    return NextResponse.json({ error: '创建会话失败' }, { status: 500 })
  }
}

// 获取塔罗牌会话信息
export async function GET(request: NextRequest) {
  try {
    const db = createDb()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('id')

    if (!sessionId) {
      return NextResponse.json({ error: '缺少会话ID' }, { status: 400 })
    }

    const [sessionData] = await db.select().from(tarotSessions).where(eq(tarotSessions.id, sessionId)).limit(1)

    if (!sessionData) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 })
    }

    return NextResponse.json(sessionData)
  } catch (error) {
    console.error('获取塔罗牌会话失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 更新塔罗牌会话（抽牌结果和AI解读）
export async function PUT(request: NextRequest) {
  try {
    const db = createDb()
    const body: UpdateSessionRequest = await request.json()
    const { sessionId, cards, aiInterpretation, status } = body

    if (!sessionId) {
      return NextResponse.json({ error: '缺少会话ID' }, { status: 400 })
    }

    const now = new Date()
    const updateData: any = {
      updatedAt: now
    }

    if (cards) {
      updateData.cards = JSON.stringify(cards)
      updateData.status = 'drawing'
    }

    if (aiInterpretation) {
      updateData.aiInterpretation = aiInterpretation
      updateData.status = 'completed'
      updateData.completedAt = now
    }

    if (status) {
      updateData.status = status
    }

    await db.update(tarotSessions).set(updateData).where(eq(tarotSessions.id, sessionId))

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('更新塔罗牌会话失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
