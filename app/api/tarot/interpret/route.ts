import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

import { hasEnoughTokens, updateUserTokenUsage } from '@/actions/token-management'
import { auth } from '@/lib/auth'

interface InterpretRequest {
  question: string
  spreadName: string
  spreads: any[]
  spreadDesc?: string
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const hasTokens = await hasEnoughTokens(session.user.id, 0)

  if (!hasTokens) {
    throw new Error('Not enough tokens')
  }
  try {
    const body = (await request.json()) as InterpretRequest
    const { question, spreadName, spreads, spreadDesc } = body

    if (!question || !spreadName || !spreads || !Array.isArray(spreads)) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!
    })

    let prompt = `你是一位经验丰富、富有同情心的塔罗牌解读师。
    请根据用户的问题、所选牌阵和翻开的牌面，进行专业、深入、富有启发性的塔罗解读。
    解读应包含对每张牌在特定位置的含义解释，以及一个综合性的总结和具体可执行的建议。
    请以清晰、积极的语言呈现，避免过于宿命论的表述，强调用户的自主选择权。

    用户的问题是："${question}"
    所选牌阵是："${spreadName}"${spreadDesc ? `\n牌阵说明："${spreadDesc}"` : ''}

    翻开的牌面信息如下：
    `

    spreads.forEach((pos: any, index: number) => {
      prompt += `\n位置 ${index + 1}：${pos.name} (${pos.direction === 'reversed' ? '逆位' : '正位'})`
    })

    prompt += `\n\n请先逐一分析每张牌在当前位置的意义，然后给出整体解读和具体的行动建议。使用清晰的分段格式，让解读易于阅读和理解。`

    const model = 'gemini-2.0-flash-exp'

    const chat = ai.chats.create({
      model: model,
      config: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        systemInstruction: {
          parts: [{ text: prompt }]
        }
      }
    })

    // 用于统计token消耗
    let totalTokensUsed = 0

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream({
            message: [{ text: '请开始解读。' }]
          })

          let isFirstChunk = true

          for await (const chunk of result) {
            const text = chunk.text
            if (text) {
              // 发送文本块
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`))
            }

            // 在第一个chunk中获取使用的token数量
            if (isFirstChunk && chunk.usageMetadata) {
              const inputTokens = chunk.usageMetadata.promptTokenCount || 0
              const outputTokens = chunk.usageMetadata.candidatesTokenCount || 0
              totalTokensUsed = inputTokens + outputTokens
              isFirstChunk = false
            }
          }

          // 更新用户token使用量
          if (totalTokensUsed > 0 && session.user?.id) {
            try {
              await updateUserTokenUsage(session.user.id, totalTokensUsed)
            } catch (error) {
              console.error('Failed to update token usage:', error)
            }
          }

          // 发送结束标记
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: '解读过程中发生错误' })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
