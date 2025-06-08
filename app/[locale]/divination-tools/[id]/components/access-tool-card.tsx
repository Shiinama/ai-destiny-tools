'use client'

import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'

interface AccessToolCardProps {
  tool: {
    url: string
    platform: string | null
    name: string
  }
}

export default function AccessToolCard({ tool }: AccessToolCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Access Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full gap-2">
          <Link href={tool.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} />
            Visit {tool.name}
          </Link>
        </Button>

        {tool.platform && tool.platform.length > 0 && (
          <div className="mt-4">
            <p className="text-muted-foreground mb-2 text-sm">Available on:</p>
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
