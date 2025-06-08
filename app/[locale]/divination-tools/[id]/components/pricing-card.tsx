'use client'

import { Check } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PricingCardProps {
  tool: {
    isFree: boolean | null
    price: string | null
  }
}

export default function PricingCard({ tool }: PricingCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Pricing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-baseline">
          <span className="text-3xl font-bold">{tool.isFree ? 'Free' : tool.price || 'Paid'}</span>
          {!tool.isFree && tool.price && (
            <span className="text-muted-foreground ml-2 text-sm">
              {tool.price.includes('/') ? '' : 'one-time payment'}
            </span>
          )}
        </div>

        <ul className="space-y-2">
          <li className="flex items-center">
            <Check className="text-primary mr-2 h-4 w-4" />
            <span>{tool.isFree ? 'No payment required' : 'Premium features'}</span>
          </li>
          {tool.isFree && (
            <li className="flex items-center">
              <Check className="text-primary mr-2 h-4 w-4" />
              <span>Basic functionality</span>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}
