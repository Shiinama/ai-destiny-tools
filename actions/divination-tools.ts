'use server'

import { GoogleGenAI } from '@google/genai'
import { eq, like, sql, and } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { divinationTools, divinationCategories, ToolStatus } from '@/lib/db/schema'

export type DivinationToolInput = {
  name: string
  description: string
  url: string
  imageUrl: string
  categoryId: string
  content?: string
  platform?: string
  isFree?: boolean
  status: ToolStatus
  price?: string
  contactInfo?: string
  logoUrl?: string
  screenshotUrls?: string
  locale?: string
}

export type DivinationToolUpdateInput = DivinationToolInput & {
  status?: ToolStatus
}

export async function getPaginatedTools({
  page = 1,
  pageSize = 10,
  status,
  search,
  categoryId,
  locale
}: {
  page?: number
  pageSize?: number
  status?: ToolStatus
  search?: string
  categoryId?: string
  locale?: string
}) {
  const offset = (page - 1) * pageSize
  const db = createDb()

  const conditions = []

  if (status) {
    conditions.push(eq(divinationTools.status, status))
  }

  if (search) {
    conditions.push(like(divinationTools.name, `%${search}%`))
  }

  if (categoryId) {
    conditions.push(eq(divinationTools.categoryId, categoryId))
  }

  if (locale) {
    conditions.push(eq(divinationTools.locale, locale))
  }

  const query = db
    .select({
      tools: divinationTools,
      categoryKey: divinationCategories.key
    })
    .from(divinationTools)
    .leftJoin(divinationCategories, eq(divinationTools.categoryId, divinationCategories.id))

  const filteredQuery = conditions.length > 0 ? query.where(and(...conditions)) : query

  const paginatedQuery = filteredQuery.orderBy(divinationTools.display_order).limit(pageSize).offset(offset)

  const countQuery = db.select({ count: sql`count(*)` }).from(divinationTools)

  const countFilteredQuery = conditions.length > 0 ? countQuery.where(and(...conditions)) : countQuery

  const countResult = await countFilteredQuery.execute()
  const totalCount = Number(countResult[0].count)
  const totalPages = Math.ceil(totalCount / pageSize)

  const tools = await paginatedQuery.execute()

  return {
    tools: tools.map((item) => ({
      ...item.tools,
      categoryKey: item.categoryKey
    })),
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      pageSize
    }
  }
}

export async function getToolById(id: string) {
  const db = createDb()
  const result = await db
    .select({
      tool: divinationTools,
      categoryKey: divinationCategories.key
    })
    .from(divinationTools)
    .leftJoin(divinationCategories, eq(divinationTools.categoryId, divinationCategories.id))
    .where(eq(divinationTools.id, id))
    .execute()

  return {
    ...result[0].tool,
    categoryKey: result[0].categoryKey
  }
}

export async function createTool(data: DivinationToolInput) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const db = createDb()

  const result = await db
    .insert(divinationTools)
    .values({
      ...data,
      userId: session.user.id
    })
    .returning()
    .execute()

  return result[0]
}

export async function updateTool(id: string, data: DivinationToolUpdateInput) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const db = createDb()

  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_ID.split(',').includes(session.user.id)

  if (!isAdmin) {
    const tool = await db.select().from(divinationTools).where(eq(divinationTools.id, id)).execute()

    if (tool.length === 0 || tool[0].userId !== session.user.id) {
      throw new Error('Unauthorized')
    }
  }

  const result = await db.update(divinationTools).set(data).where(eq(divinationTools.id, id)).returning().execute()

  return result[0]
}

export async function updateToolStatus(id: string, status: ToolStatus) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_ID.split(',').includes(session.user.id)
  if (!isAdmin) {
    throw new Error('Unauthorized')
  }

  const db = createDb()

  const result = await db
    .update(divinationTools)
    .set({ status })
    .where(eq(divinationTools.id, id))
    .returning()
    .execute()

  return result[0]
}

export async function batchUpdateToolOrder(updates: Array<{ id: string; order: number }>) {
  const db = createDb()
  const results = []

  const batchSize = 10
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)

    const updatePromises = batch.map(async ({ id, order }) => {
      try {
        const result = await db
          .update(divinationTools)
          .set({ display_order: order })
          .where(eq(divinationTools.id, id))
          .returning()
          .execute()

        return result[0]
      } catch (error) {
        console.error(`Failed to update tool ${id}:`, error)
        return null
      }
    })

    const batchResults = await Promise.all(updatePromises)
    results.push(...batchResults.filter(Boolean))
  }

  return results
}

export async function updateToolOrder(id: string, newOrder: number) {
  const db = createDb()

  const result = await db
    .update(divinationTools)
    .set({ display_order: newOrder })
    .where(eq(divinationTools.id, id))
    .returning()
    .execute()

  return result[0]
}

export async function updateToolsOrder(items: Array<{ id: string; index: number }>) {
  const db = createDb()

  const results = await Promise.all(
    items.map(async ({ id, index }) => {
      try {
        const result = await db
          .update(divinationTools)
          .set({ display_order: index })
          .where(eq(divinationTools.id, id))
          .returning()
          .execute()

        return result[0]
      } catch (error) {
        console.error(`Failed to update tool ${id}:`, error)
        return null
      }
    })
  )

  return results.filter(Boolean)
}

export async function deleteTool(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const db = createDb()

  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_ID.split(',').includes(session.user.id)

  if (!isAdmin) {
    const tool = await db.select().from(divinationTools).where(eq(divinationTools.id, id)).execute()

    if (tool.length === 0 || tool[0].userId !== session.user.id) {
      throw new Error('Unauthorized')
    }
  }

  await db.delete(divinationTools).where(eq(divinationTools.id, id)).execute()
}

export async function getCategories() {
  const db = createDb()
  return db.select().from(divinationCategories).orderBy(divinationCategories.display_order).execute()
}

interface SpreadRecommendation {
  spreadType: string
  spreadName: string
  reason: string
  spreadCategory: string
  spreadDesc: string
  spreadGuide?: string
  spreadLink?: string
}

export async function recommendTarotSpread(question: string): Promise<SpreadRecommendation> {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })

    const spreadsData = `
    [
      {
        "type": "常规占卜",
        "route": "daily",
        "desc": "当生活中遇到迷茫或需要指引时，常规占卜能为你提供全面的视角。它不局限于特定领域，可以针对你的现状、未来趋势或某个具体问题提供洞见。",
        "spreads": [
          {"name": "单张", "desc": "抽取一张塔罗牌，可以对任何问题做出占卜。", "link": "/spreads/daily/single"},
          {"name": "线性牌阵", "desc": "擅长于解读某种事件顺序、因果关系，或由a到b的一种方式。", "link": "/spreads/daily/linear"},
          {"name": "基础牌阵", "desc": "传达建议的牌阵，帮你了解现状以及影响因素，指出前进的道路。", "link": "/spreads/daily/foundation"},
          {"name": "凯尔特十字", "desc": "著名的10张塔罗牌阵，可以为众多主题提供全面的答案。", "link": "/spreads/daily/celtic-cross"}
        ]
      },
      {
        "type": "职业发展",
        "route": "career",
        "desc": "在职业生涯的十字路口，是继续深耕当前领域，还是勇敢转型？职业发展方向占卜将深入解析你的天赋潜力、职场挑战以及未来机遇。",
        "spreads": [
          {"name": "自我协调", "desc": "在开始开展业务或项目之前，了解自己的角色和目的。"},
          {"name": "找工作", "desc": "为求职而创建的塔罗牌阵，揭示阻碍和问题。"},
          {"name": "经营策略", "desc": "展示事务的方方面面，提供解决问题、完成目标的策略。"}
        ]
      },
      {
        "type": "情感关系",
        "route": "love-relationship",
        "desc": "情感的旅途总是充满未知与挑战。无论是寻找真爱、修复现有关系，还是从过往伤痛中走出，情感关系占卜都能提供深层洞察。",
        "spreads": [
          {"name": "经典3张", "desc": "快速诊断两个人之间的关系动态。"},
          {"name": "寻找爱情", "desc": "探索未来的爱情会是什么样子。"},
          {"name": "匹配度预测", "desc": "关注关系中双方的异同之处，以及双方的匹配程度。"}
        ]
      },
      {
        "type": "向内探索",
        "route": "spiritual",
        "desc": "真正的力量源于对自我的深刻理解。向内探索方向占卜将引导你踏上心灵之旅，揭示内心深处的潜意识模式、隐藏的天赋与未被发掘的智慧。",
        "spreads": [
          {"name": "自我成长", "desc": "权衡利弊，看清哪些选择是遵从内心而做出的。"},
          {"name": "梦镜", "desc": "比较梦境世界和清醒世界的关系，理解梦的讯息。"},
          {"name": "自爱", "desc": "突出你最好和最可爱的部分，提升自我接纳。"}
        ]
      }
    ]
    `

    const systemPrompt = `
你是一位专业的塔罗牌解读师和AI助手。根据用户的问题，从给定的牌阵类型中推荐最适合的一种，并给出详细的推荐理由。

牌阵类型数据：
${spreadsData}

请根据用户的问题内容，分析以下几个方面：
1. 问题的核心主题（职业、情感、个人成长、日常生活等）
2. 问题的复杂程度和深度
3. 用户可能需要的洞察类型

然后从四种牌阵类型中选择最合适的一种：
- 常规占卜：适合一般性问题、寻求全面指引
- 职业发展：适合工作、事业、职业规划相关问题
- 情感关系：适合爱情、人际关系、情感困扰
- 向内探索：适合自我认知、心灵成长、内在探索

请用JSON格式回复，包含：
{
  "spreadType": "推荐的牌阵类型（route值）",
  "spreadName": "推荐的具体牌阵名称", 
  "reason": "详细的推荐理由，解释为什么这个牌阵最适合用户的问题",
  "spreadCategory": "牌阵类型的中文名称",
  "spreadDesc": "推荐牌阵的详细描述"
}

推荐理由要：
- 简洁明了，大约50-80字
- 直接关联用户的问题内容
- 说明这个牌阵如何帮助解决用户的疑惑
- 语气温和、专业且富有洞察力
`

    const userPrompt = `用户的问题是：${question}`

    const model = 'gemini-2.0-flash-exp'

    const chat = ai.chats.create({
      model: model,
      config: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      }
    })

    const result = await chat.sendMessage({
      message: [{ text: userPrompt }]
    })

    const response = result.text!

    // 清理响应文本，移除可能的markdown标记
    let cleanResponse = response.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const recommendation = JSON.parse(cleanResponse) as SpreadRecommendation

    return recommendation
  } catch (error) {
    console.error('Error recommending tarot spread:', error)
    // 返回默认推荐
    return {
      spreadType: 'daily',
      spreadName: '基础牌阵',
      reason: '基础牌阵是最适合解答各类问题的万能牌阵，能为你提供全面的视角和实用的建议。',
      spreadCategory: '常规占卜',
      spreadDesc: '传达建议的牌阵，帮你了解现状以及影响因素，指出前进的道路。'
    }
  }
}
