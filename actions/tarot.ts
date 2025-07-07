'use server'

import { GoogleGenAI } from '@google/genai'

import { hasEnoughTokens, updateUserTokenUsage } from '@/actions/token-management'
import { auth } from '@/lib/auth'

interface SpreadRecommendation {
  spreadType: string
  spreadName: string
  reason: string
  spreadCategory: string
  spreadDesc: string
  spreadGuide?: string
  spreadLink?: string
  cardCount: number
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

## 可用牌阵类型：

### 1. 常规占卜 (daily) - 适合一般性问题、寻求全面指引
   (1) 单张 (daily/single) - 1张牌 - 抽取一张塔罗牌，可以对任何问题做出占卜
   (2) 线性牌阵 (daily/linear) - 3张牌 - 擅长于解读某种事件顺序、因果关系，或由a到b的一种方式  
   (3) 基础牌阵 (daily/foundation) - 3张牌 - 传达建议的牌阵，帮你了解现状以及影响因素，指出前进的道路
   (4) 平衡牌阵 (daily/balanced) - 3张牌 - 三张牌有一个共同的顶点，每张牌所展示的方面都同样重要
   (5) 凯尔特十字 (daily/celtic-cross) - 10张牌 - 著名的10张塔罗牌阵，可以为众多主题提供全面的答案
   (6) 二选一牌阵 (daily/either-or) - 5张牌 - 当你在两个选项之间摇摆不定时，帮你看清二者的关键
   (7) 新年展望 (daily/new-years-planning) - 8张牌 - 为过去一年做总结，指导你为新一年做好准备

### 2. 职业发展 (career) - 适合工作、事业、职业规划相关问题
   (1) 自我协调 (career/self-alignment) - 9张牌 - 帮你了解角色和目的，为开展业务或项目奠定基础
   (2) 找工作 (career/job-search) - 6张牌 - 揭示阻碍你实现职业潜力的内部和外部障碍
   (3) 经营策略 (career/business-strategy) - 10张牌 - 展示事务的方方面面，提供解决问题的策略
   (4) Brick by Brick (career/brick-by-brick) - 6张牌 - 检查工作情况和状态，找到更长远的发展图景
   (5) 面对挑战 (career/facing-challenges) - 6张牌 - 当工作很糟糕时，帮你诊断问题并找到解决方向
   (6) Mind and Heart (career/mind-and-heart) - 6张牌 - 检查感性和实际生活，看事业如何影响这些情况
   (7) Shooting Forward (career/shooting-forward) - 5张牌 - 帮你找到实现理想职业的途径和内在品质

### 3. 情感关系 (love-relationship) - 适合爱情、人际关系、情感困扰
   (1) 经典3张 (love-relationship/3-card) - 3张牌 - 快速诊断两个人之间的关系动态
   (2) 十字牌阵 (love-relationship/5-card-cross) - 5张牌 - 详细说明关系如何随时间发展
   (3) 寻找爱情 (love-relationship/finding-love) - 5张牌 - 帮你探索未来的爱情会是什么样子
   (4) 匹配度预测 (love-relationship/compatibility) - 7张牌 - 关注关系中双方的异同和匹配程度
   (5) Readiness for Love (love-relationship/readiness-for-love) - 6张牌 - 了解自己对于爱情的准备程度
   (6) 继续还是离去 (love-relationship/stay-or-go) - 6张牌 - 当关系出现严重问题时的思考指引
   (7) Broken Heart (love-relationship/broken-heart) - 6张牌 - 审视关系状况，揭示修复关系的努力方向

### 4. 向内探索 (spiritual) - 适合自我认知、心灵成长、内在探索
   (1) 自我成长 (spiritual/self-growth) - 10张牌 - 权衡内心欲望和他人期望，看清真实选择
   (2) 梦镜 (spiritual/dream-mirror) - 7张牌 - 比较梦境世界和清醒世界，理解梦的讯息
   (3) 荣格原型 (spiritual/jungian-archetypes) - 5张牌 - 找到自己在荣格心理学中不同原型的特质
   (4) 自爱 (spiritual/self-love) - 6张牌 - 突出你最好和最可爱的部分，学习如何爱自己

## 推荐策略：
- 分析用户问题的核心主题和情感背景
- 考虑问题的复杂程度（简单问题推荐少张牌，复杂问题推荐多张牌）
- 匹配最相关的牌阵类型和具体牌阵
- 优先推荐能够深入解析问题本质的牌阵

## 返回格式：
严格按照以下JSON格式返回，不要添加任何markdown标记：

{
  "spreadType": "spiritual",
  "spreadCategory": "向内探索", 
  "spreadName": "自我成长",
  "spreadDesc": "权衡内心欲望和他人期望，看清真实选择",
  "spreadLink": "spiritual/self-growth",
  "cardCount": 10,
  "reason": "详细的推荐理由"
}

## 重要约束：
1. spreadType只能是: daily, career, love-relationship, spiritual
2. spreadName、spreadLink、cardCount必须来自上述真实存在的牌阵
3. 不要编造或修改任何数据
4. cardCount必须与所选牌阵的实际卡牌数量一致

## 推荐理由要求：
- 简洁明了，大约50-80字
- 直接关联用户的问题内容
- 说明这个牌阵如何帮助解决用户的疑惑
- 语气温暖、专业且富有智慧
- 体现塔罗师的专业素养和深度理解
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
      spreadLink: 'daily/single',
      cardCount: 1
    }
  }
}
