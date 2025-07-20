import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { divinationTools } from '@/lib/db/schema'

type ToolWithCategoryKey = typeof divinationTools.$inferSelect & { categoryKey: string | null }

interface RelatedToolsProps {
  currentTool: ToolWithCategoryKey
  relatedTools: ToolWithCategoryKey[]
}

export default function RelatedTools({ currentTool, relatedTools }: RelatedToolsProps) {
  const t = useTranslations('divinationTools')

  if (relatedTools.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl font-bold">{t('relatedTools')}</CardTitle>
            <CardDescription>
              {t('relatedToolsDescription', { category: currentTool.categoryKey || 'divination' })}
            </CardDescription>
          </div>
          <Button variant="outline" size="default">
            <Link href={`/${currentTool.categoryKey}`}>{t('viewMore')}</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {relatedTools.map((tool) => (
            <Link key={tool.id} href={`/divination-tools/${tool.id}`} className="group block">
              <Card className="hover:shadow-primary/10 h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-48 w-full overflow-hidden">
                  {tool.imageUrl ? (
                    <Image
                      src={tool.imageUrl}
                      alt={tool.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="from-primary/10 to-secondary/10 flex h-full w-full items-center justify-center bg-gradient-to-br">
                      <span className="text-muted-foreground text-3xl font-bold">
                        {tool.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {!tool.isFree && (
                    <Badge className="bg-primary text-primary-foreground absolute top-3 right-3">
                      {tool.price || t('paid')}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <h3 className="group-hover:text-primary text-lg leading-tight font-semibold transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">{tool.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
