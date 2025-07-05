'use server'

import { GoogleGenAI } from '@google/genai'

import { hasEnoughTokens, updateUserTokenUsage } from '@/actions/token-management'
import spreadsData from '@/app/[locale]/tools/tarot/static/tarot/json/spreads.json'
import { auth } from '@/lib/auth'

interface SpreadRecommendation {
  spreadType: string
  spreadName: string
  reason: string
  spreadCategory: string
  spreadDesc: string
  spreadGuide?: string
  spreadLink?: string
}
// 推荐牌阵
export async function recommendTarotSpread(question: string): Promise<SpreadRecommendation> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const hasTokens = await hasEnoughTokens(session.user.id, 0)

  if (!hasTokens) {
    throw new Error('Not enough tokens')
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })

    const systemPrompt = `
你是一位专业的塔罗牌解读师和AI助手。根据用户的问题，从给定的牌阵数据中推荐最适合的一种，并给出详细的推荐理由。

牌阵数据结构说明：
数据是一个数组，包含4个对象，每个对象都有：
- type: 牌阵类型中文名称（如"常规占卜"）
- route: 牌阵类型英文标识（如"daily"）
- spreads: 该类型下的具体牌阵数组，每个牌阵有name和link属性

牌阵类型数据：
${JSON.stringify(spreadsData, null, 2)}

请根据用户的问题选择最合适的牌阵类型和具体牌阵：

四种牌阵类型对应关系：
- "常规占卜" (route: "daily"): 适合一般性问题、寻求全面指引
- "职业发展" (route: "career"): 适合工作、事业、职业规划相关问题  
- "情感关系" (route: "love-relationship"): 适合爱情、人际关系、情感困扰
- "向内探索" (route: "spiritual"): 适合自我认知、心灵成长、内在探索

返回JSON格式，严格按照以下要求：
{
  "spreadType": "必须是route值(daily/career/love-relationship/spiritual)",
  "spreadName": "必须是选中类型下spreads数组中某个对象的name值", 
  "reason": "详细的推荐理由",
  "spreadCategory": "对应的type值(如常规占卜)",
  "spreadDesc": "选中牌阵的desc值",
  "spreadLink": "选中牌阵的link值(如daily/single)",
  "cardCount": "选中牌阵的count值(如1)"
}

重要：
1. spreadType只能是: daily, career, love-relationship, spiritual
2. spreadName和spreadLink必须来自数据中真实存在的牌阵
3. 不要编造或修改任何link值

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

    let tokensUsed = 0

    if (result.usageMetadata) {
      const inputTokens = result.usageMetadata.promptTokenCount || 0
      const outputTokens = result.usageMetadata.candidatesTokenCount || 0
      tokensUsed = inputTokens + outputTokens
    }

    await updateUserTokenUsage(session.user.id, tokensUsed)

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
      spreadName: '单张',
      reason: '基础牌阵是最适合解答各类问题的万能牌阵，能为你提供全面的视角和实用的建议。',
      spreadCategory: '常规占卜',
      spreadDesc: '传达建议的牌阵，帮你了解现状以及影响因素，指出前进的道路。',
      spreadLink: 'daily/single'
    }
  }
}
