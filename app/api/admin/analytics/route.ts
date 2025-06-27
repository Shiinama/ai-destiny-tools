import { NextRequest, NextResponse } from 'next/server'

import { getToolsAnalyticsOverview } from '@/actions/analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const result = await getToolsAnalyticsOverview(page, pageSize)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    )
  }
}
