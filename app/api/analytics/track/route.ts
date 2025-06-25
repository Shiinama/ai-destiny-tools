import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { toolAnalytics } from '@/lib/db/schema'

interface TrackingData {
  toolId: string
  referrer?: string
}

// 解析User-Agent获取设备信息
function parseUserAgent(userAgent: string) {
  const deviceType = /Mobile|Android|iPhone|iPad/.test(userAgent)
    ? /iPad/.test(userAgent)
      ? 'tablet'
      : 'mobile'
    : 'desktop'

  let browser = 'Unknown'
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'

  let operatingSystem = 'Unknown'
  if (userAgent.includes('Windows')) operatingSystem = 'Windows'
  else if (userAgent.includes('Mac')) operatingSystem = 'macOS'
  else if (userAgent.includes('Linux')) operatingSystem = 'Linux'
  else if (userAgent.includes('Android')) operatingSystem = 'Android'
  else if (userAgent.includes('iOS')) operatingSystem = 'iOS'

  return { deviceType, browser, operatingSystem }
}

// 从Referrer获取来源域名
function getReferrerDomain(referrer: string): string | null {
  if (!referrer) return null
  try {
    const url = new URL(referrer)
    return url.hostname
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackingData = await request.json()
    const { toolId, referrer } = body

    if (!toolId) {
      return NextResponse.json({ error: 'toolId is required' }, { status: 400 })
    }

    // 获取当前用户信息
    const session = await auth()
    const userId = session?.user?.id || null

    // 获取请求头信息
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const acceptLanguage = headersList.get('accept-language') || ''
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')

    // 获取IP地址
    const ipAddress = forwardedFor?.split(',')[0] || realIp || null

    // 解析设备信息
    const { deviceType, browser, operatingSystem } = parseUserAgent(userAgent)

    // 获取语言信息
    const language = acceptLanguage.split(',')[0]?.split('-')[0] || null

    // 处理来源信息
    const referrerDomain = getReferrerDomain(referrer || '')

    // 生成会话ID（简单实现，可以后续优化）
    const sessionId = `${ipAddress}-${Date.now()}`

    // 保存到数据库
    const db = createDb()
    await db.insert(toolAnalytics).values({
      toolId,
      userId,
      ipAddress,
      userAgent,
      deviceType,
      operatingSystem,
      browser,
      referrer: referrer || null,
      referrerDomain,
      language,
      sessionId,
      visitedAt: new Date()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking analytics:', error)
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 })
  }
}
