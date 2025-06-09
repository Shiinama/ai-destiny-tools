'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ScreenshotsSectionProps {
  tool: {
    screenshotUrls: string | null
    name: string
  }
}

export default function ScreenshotsSection({ tool }: ScreenshotsSectionProps) {
  const t = useTranslations('divinationTools')
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!tool.screenshotUrls || tool.screenshotUrls.split(',').length === 0) {
    return null
  }

  const screenshots = tool.screenshotUrls.split(',')

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1))
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="mb-4 text-xl font-bold">{t('screenshots')}</h2>
        <div className="relative">
          <div className="relative mx-auto h-64 w-full overflow-hidden rounded-md md:h-80">
            <Image
              src={screenshots[currentIndex]}
              alt={`${tool.name} ${t('screenshot')} ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {screenshots.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="bg-background/80 absolute top-1/2 left-0 -translate-y-1/2 rounded-full shadow-md"
                onClick={handlePrevious}
                aria-label={t('previousImage')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="bg-background/80 absolute top-1/2 right-0 -translate-y-1/2 rounded-full shadow-md"
                onClick={handleNext}
                aria-label={t('nextImage')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {screenshots.length > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full ${index === currentIndex ? 'bg-primary' : 'bg-muted'}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`${t('goToImage')} ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
