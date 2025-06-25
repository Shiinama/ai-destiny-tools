'use client'

import { ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'

interface AccessToolCardProps {
  tool: {
    id: string
    url: string
    platform: string | null
    name: string
  }
}

export default function AccessToolCard({ tool }: AccessToolCardProps) {
  const t = useTranslations('divinationTools')

  // 处理工具访问点击
  const handleToolClick = async () => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toolId: tool.id,
          referrer: window.location.href
        })
      }).catch((error) => {
        console.error('Failed to track analytics:', error)
      })
    } catch (error) {
      console.error('Failed to track analytics:', error)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{t('accessTool')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full gap-2">
          <Link href={tool.url} target="_blank" onClick={handleToolClick}>
            <ExternalLink size={16} />
            {t('visit')}
          </Link>
        </Button>

        {tool.platform && tool.platform.length > 0 && (
          <div className="mt-4">
            <p className="text-muted-foreground mb-2 text-sm">{t('availableOn')}:</p>
            <div className="flex flex-wrap gap-2">
              {tool.platform.split(',').map((platform) => (
                <div
                  key={platform}
                  className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs capitalize"
                >
                  {platform}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
