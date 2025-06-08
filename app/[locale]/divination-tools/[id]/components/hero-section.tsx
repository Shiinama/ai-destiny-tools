'use client'

import { ExternalLink } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

interface HeroSectionProps {
  tool: {
    name: string
    description: string
    imageUrl: string | null
    logoUrl: string | null
    url: string
    isFree: boolean | null
    price: string | null
  }
}

export default function HeroSection({ tool }: HeroSectionProps) {
  return (
    <div className="from-primary/10 to-secondary/10 relative mb-8 h-72 w-full overflow-hidden rounded-xl bg-gradient-to-r">
      {tool.imageUrl && <Image src={tool.imageUrl} alt={tool.name} fill className="object-cover opacity-90" />}
      <div className="from-background/90 absolute inset-0 bg-gradient-to-t to-transparent">
        <div className="absolute bottom-0 flex w-full items-center gap-6 p-6">
          <div className="bg-card relative h-24 w-24 overflow-hidden rounded-xl border shadow-lg">
            {tool.logoUrl && <Image src={tool.logoUrl} alt={`${tool.name} logo`} fill className="object-contain p-2" />}
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{tool.name}</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">{tool.description}</p>
            <div className="mt-3 flex items-center gap-3">
              <Badge variant={tool.isFree ? 'secondary' : 'default'} className="text-sm">
                {tool.isFree ? 'Free' : tool.price}
              </Badge>
              <Button size="sm" variant="outline" asChild className="gap-2">
                <Link href={tool.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} />
                  Visit Website
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
