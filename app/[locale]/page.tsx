import { getTranslations } from 'next-intl/server'

import { getSites } from '@/actions/ai-navigation/sites'
import { Card, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'

export default async function Home() {
  const t = await getTranslations('HomePage')
  const { data: sites = [] } = await getSites()

  return (
    <div className="text-foreground container min-h-screen space-y-12 rounded-lg py-8">
      <header className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">{t('description')}</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sites.map((site) => (
              <Card key={site.id} className="overflow-hidden transition-all hover:shadow-lg">
                <div className="relative h-40 w-full">
                  <img
                    src={site.imageUrl!}
                    alt={site.name}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium">{site.name}</h3>
                  <CardDescription>{site.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    {t('visitSite')}
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
