import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface BenefitItem {
  title: string
  desc: string
}

export function PremiumBenefits() {
  const t = useTranslations('submitTools.premium')
  const benefits: BenefitItem[] = [
    {
      title: t('listingTrafficForever'),
      desc: t('listingTrafficForeverDesc')
    },
    {
      title: t('48hoursAppear'),
      desc: t('48hoursAppearDesc')
    },
    {
      title: t('getDofollowLinks'),
      desc: t('getDofollowLinksDesc')
    },

    {
      title: t('higherRankingExposure'),
      desc: t('higherRankingExposureDesc')
    },
    {
      title: t('borderHighlight'),
      desc: t('borderHighlightDesc')
    },
    {
      title: t('getDestinyAIEmbeds'),
      desc: t('getDestinyAIEmbedsDesc')
    }
  ]
  return (
    <div className="border-primary bg-primary/5 rounded-lg border-2 p-6">
      <div className="mb-4">
        <h2 className="text-primary text-xl font-bold">{t('limitedTimeOffer')}</h2>
        <p className="mt-2 text-2xl font-bold">{t('only25')}</p>
      </div>

      <div className="space-y-3">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-start gap-2">
            <CheckCircle2 className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <span className="font-bold">{benefit.title}</span>
              <p className="text-muted-foreground text-sm">{benefit.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
