/**
 * 分析追踪工具函数
 */

interface TrackToolAccessParams {
  toolId: string
  referrer?: string
}

/**
 * 追踪工具访问
 * @param params 追踪参数
 * @returns Promise<void>
 */
export async function trackToolAccess(params: TrackToolAccessParams): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        toolId: params.toolId,
        referrer: params.referrer || (typeof window !== 'undefined' ? window.location.href : '')
      })
    }).catch((error) => {
      console.error('Failed to track analytics:', error)
    })
  } catch (error) {
    console.error('Failed to track analytics:', error)
  }
}
