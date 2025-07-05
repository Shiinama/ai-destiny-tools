import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { checkUserIsAdmin } from '@/hooks/use-is-admin'
import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { toolAnalytics, divinationTools } from '@/lib/db/schema'

async function checkAdminAccess() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: Please login')
  }

  const isAdmin = await checkUserIsAdmin(session.user.id)
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }
}

// 生成测试数据
export async function POST(request: NextRequest) {
  try {
    await checkAdminAccess()

    const { count = 100000 } = (await request.json()) as any

    const db = createDb()

    // 获取所有已批准的工具
    const tools = await db
      .select({ id: divinationTools.id })
      .from(divinationTools)
      .where(eq(divinationTools.status, 'approved'))

    if (tools.length === 0) {
      return NextResponse.json({ error: 'No approved tools found to generate test data for' }, { status: 400 })
    }

    // 预定义的测试数据选项
    const deviceTypes = ['mobile', 'desktop', 'tablet']
    const operatingSystems = ['Windows', 'macOS', 'iOS', 'Android', 'Linux']
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera']
    const languages = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'es-ES', 'fr-FR', 'de-DE']
    const referrerDomains = [
      'google.com',
      'baidu.com',
      'bing.com',
      'yahoo.com',
      'duckduckgo.com',
      'facebook.com',
      'twitter.com',
      'reddit.com',
      'github.com',
      null // 直接访问
    ]

    // 生成IP地址的简单函数
    const generateIP = () => {
      return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    }

    // 生成User Agent的简单函数
    const generateUserAgent = (browser: string, os: string) => {
      const versions = {
        Chrome: '120.0.0.0',
        Safari: '17.0',
        Firefox: '121.0',
        Edge: '120.0.0.0',
        Opera: '106.0.0.0'
      }
      return `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/${versions[browser as keyof typeof versions] || '1.0'} Safari/537.36`
    }

    // 生成Session ID
    const generateSessionId = () => {
      return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    }
    const now = new Date()

    // 逐条插入数据以完全避免SQLite变量限制
    let generatedCount = 0

    for (let i = 0; i < count; i++) {
      // 随机选择工具
      const tool = tools[Math.floor(Math.random() * tools.length)]

      // 生成随机时间（过去6个月内）
      const randomDaysAgo = Math.floor(Math.random() * 180)
      const randomHours = Math.floor(Math.random() * 24)
      const randomMinutes = Math.floor(Math.random() * 60)
      const visitedAt = new Date(now)
      visitedAt.setDate(visitedAt.getDate() - randomDaysAgo)
      visitedAt.setHours(randomHours, randomMinutes, 0, 0)

      // 随机选择设备和浏览器信息
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]
      const operatingSystem = operatingSystems[Math.floor(Math.random() * operatingSystems.length)]
      const browser = browsers[Math.floor(Math.random() * browsers.length)]
      const language = languages[Math.floor(Math.random() * languages.length)]
      const referrerDomain = referrerDomains[Math.floor(Math.random() * referrerDomains.length)]

      // 插入单条记录
      await db.insert(toolAnalytics).values({
        toolId: tool.id,
        userId: null, // 大部分访问者是匿名的
        ipAddress: generateIP(),
        userAgent: generateUserAgent(browser, operatingSystem),
        deviceType,
        operatingSystem,
        browser,
        referrer: referrerDomain ? `https://${referrerDomain}/search?q=divination` : null,
        referrerDomain,
        language,
        sessionId: generateSessionId(),
        visitedAt,
        isSynced: false
      })

      generatedCount++

      // 每处理100条数据输出一次进度
      if (generatedCount % 100 === 0) {
        // console.log(`Generated ${generatedCount}/${count} test records`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${generatedCount} test records`,
      generatedCount,
      toolsCount: tools.length
    })
  } catch (error) {
    console.error('Generate test data error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}
