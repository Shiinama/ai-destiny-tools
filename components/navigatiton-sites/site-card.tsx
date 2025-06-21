import { useTranslations } from 'next-intl'

import { Card, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'

interface SiteCardProps {
  site: {
    id: string
    name: string
    description: string
    url: string
    imageUrl: string | null
  }
}

export default function SiteCard({ site }: SiteCardProps) {
  const t = useTranslations('HomePage')

  return (
    <Card key={site.id}>
      <div className="relative w-full overflow-hidden rounded-t-md pt-[56.25%]">
        <img src={site.imageUrl!} alt={site.name} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <CardHeader>
        <h3 className="text-lg font-medium">{site.name}</h3>
        <CardDescription className="line-clamp-4">{site.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link
          href={`/divination-tools/${site.id}`}
          target="_blank"
          rel="nofollow"
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          {t('visitSite')}
        </Link>
      </CardFooter>
    </Card>
  )
}
