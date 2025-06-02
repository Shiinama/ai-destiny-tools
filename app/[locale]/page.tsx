import { getTranslations } from 'next-intl/server'

import { getSites } from '@/actions/ai-navigation/sites'
import { Card, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'

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
              <Card key={site.id}>
                <img src={site.imageUrl!} alt={site.name} className="rounded-md" />
                <CardHeader>
                  <h3 className="text-lg font-medium">{site.name}</h3>
                  <CardDescription>{site.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    {t('visitSite')}
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
