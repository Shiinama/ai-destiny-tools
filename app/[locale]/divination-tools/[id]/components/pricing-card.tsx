'use client'

import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PricingCardProps {
  tool: {
    isFree: boolean | null
    price: string | null
  }
}

export default function PricingCard({ tool }: PricingCardProps) {
  const t = useTranslations('divinationTools')

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{t('pricing')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-baseline">
          <span className="text-3xl font-bold">{tool.isFree ? t('free') : tool.price || t('paid')}</span>
          {!tool.isFree && tool.price && (
            <span className="text-muted-foreground ml-2 text-sm">
              {tool.price.includes('/') ? '' : t('oneTimePayment')}
            </span>
          )}
        </div>

        <ul className="space-y-2">
          <li className="flex items-center">
            <Check className="text-primary mr-2 h-4 w-4" />
            <span>{tool.isFree ? t('noPaymentRequired') : t('premiumFeatures')}</span>
          </li>
          {tool.isFree && (
            <li className="flex items-center">
              <Check className="text-primary mr-2 h-4 w-4" />
              <span>{t('basicFunctionality')}</span>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}
