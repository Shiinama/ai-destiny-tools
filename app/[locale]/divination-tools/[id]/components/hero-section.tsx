'use client'

import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { checkUserIsAdmin } from '@/hooks/use-is-admin'
import { Link } from '@/i18n/navigation'
import { divinationTools } from '@/lib/db/schema'

interface HeroSectionProps {
  tool: typeof divinationTools.$inferSelect
}

export default function HeroSection({ tool }: HeroSectionProps) {
  const t = useTranslations('divinationTools')
  const session = useSession()
  const isAdmin = checkUserIsAdmin(session?.data?.user?.id)
  return (
    <div className="relative mb-8 w-full">
      {isAdmin && (
        <div className="flex justify-end py-5">
          <Button asChild>
            <Link href={`/admin/tools/edit/${tool.id}`} target="_blank" rel="nofollow">
              去编辑
            </Link>
          </Button>
        </div>
      )}
      <div className="from-primary/10 to-secondary/10 relative w-full overflow-hidden rounded-xl bg-gradient-to-r pb-[25%]">
        {tool.imageUrl && (
          <Image src={tool.imageUrl} alt={tool.name} fill className="object-cover opacity-90" sizes="100vw" priority />
        )}
        <div className="from-background/90 absolute inset-0 bg-gradient-to-t to-transparent">
          <div className="absolute bottom-0 flex w-full items-center gap-6 p-6">
            <div className="bg-card relative h-24 w-24 overflow-hidden rounded-xl border shadow-lg">
              {tool.logoUrl && (
                <Image src={tool.logoUrl} alt={`${tool.name} logo`} fill className="object-contain p-2" />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{tool.name}</h1>
              <p className="text-muted-foreground mt-1 max-w-2xl">{tool.description}</p>
              <div className="mt-3 flex items-center gap-3">
                <Badge variant={tool.isFree ? 'secondary' : 'default'} className="text-sm">
                  {tool.isFree ? t('free') : tool.price}
                </Badge>
                <Button size="sm" variant="outline" asChild className="gap-2">
                  <Link href={tool.url} target="_blank" rel="nofollow">
                    <ExternalLink size={16} />
                    {t('visitWebsite')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
