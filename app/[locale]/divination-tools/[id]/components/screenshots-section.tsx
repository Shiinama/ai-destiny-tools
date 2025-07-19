'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ScreenshotsSectionProps {
  tool: {
    screenshotUrls: string | null
    name: string
  }
}

export default function ScreenshotsSection({ tool }: ScreenshotsSectionProps) {
  const t = useTranslations('divinationTools')

  const screenshots = tool.screenshotUrls ? tool.screenshotUrls.split(',').filter((url) => url.trim() !== '') : []

  if (screenshots.length === 0) {
    return null
  }

  return (
    <Card>
      <CardContent className="px-1">
        <h2 className="p-4 text-xl font-bold">{t('screenshots')}</h2>
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={30}
          slidesPerView={1}
          className={cn(
            'rounded-md',
            '[--swiper-theme-color:var(--color-primary)]',
            '[--swiper-pagination-color:var(--color-primary)]',
            '[--swiper-navigation-color:var(--color-primary)]',
            '[--swiper-navigation-size:24px]',
            '[&_.swiper-button-prev]:h-8 [&_.swiper-button-prev]:w-8',
            '[&_.swiper-button-next]:h-8 [&_.swiper-button-next]:w-8'
          )}
        >
          {screenshots.map((src, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-80 w-full">
                <Image
                  src={src}
                  alt={`${tool.name} ${t('screenshot')} ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 80vw"
                  priority={index === 0}
                  quality={90}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </CardContent>
    </Card>
  )
}
