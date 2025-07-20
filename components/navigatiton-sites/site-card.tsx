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
      <div className="relative w-full overflow-hidden rounded-t-xl pt-[56.25%]">
        <Link href={`/divination-tools/${site.id}`} target="_blank" rel="nofollow">
          <img
            src={site.imageUrl!}
            alt={site.name}
            className="absolute inset-0 h-full w-full cursor-pointer object-cover transition-transform duration-300 hover:scale-110"
          />
        </Link>
      </div>
      <CardHeader>
        <h3 className="line-clamp-1 text-lg font-medium">{site.name}</h3>
        <CardDescription className="line-clamp-3 text-pretty">{site.description}</CardDescription>
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
