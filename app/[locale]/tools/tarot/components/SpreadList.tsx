'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import spreadsData from '../static/toart/json/spreads.json'
import defaultSpreadImage from '../static/toart/spreads/spreads1.png'

interface SpreadCategory {
  type: string
  route: string
  desc: string
  picture: string
  spreads: any[]
}

export default function SpreadList() {
  const [spreadList, setList] = useState<SpreadCategory[]>([])
  const t = useTranslations('tools.tarot')

  useEffect(() => {
    setList(spreadsData as SpreadCategory[])
  }, [])

  return (
    <div className="space-y-16">
      {spreadList.map((item, index) => {
        const isImageLeft = index % 2 === 1

        return (
          <div
            key={item.type}
            className={cn(
              'mx-auto flex max-w-5xl flex-col items-center gap-8 rounded-xl bg-black/30 p-8 backdrop-blur-sm md:flex-row md:gap-12',
              isImageLeft ? 'md:flex-row-reverse' : ''
            )}
          >
            <div className="w-full md:w-1/2">
              <div className="relative overflow-hidden rounded-xl">
                {/* 注意：json中的图片路径是示例，这里我们先使用一张默认图片 */}
                <Image
                  src={defaultSpreadImage}
                  alt={item.type}
                  width={500}
                  height={300}
                  className="h-auto w-full rounded-lg object-cover shadow-md"
                />
              </div>
            </div>

            <div className="w-full space-y-4 text-center md:w-1/2 md:text-left">
              <h2 className="text-3xl font-bold text-white">{item.type}</h2>
              <p className="text-gray-300">{item.desc}</p>
              <Link href={`/tools/tarot/question?type=${item.route}`}>
                <Button size="lg" className="rounded-lg bg-purple-600 text-base text-white hover:bg-purple-700">
                  {t('start')}
                </Button>
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
