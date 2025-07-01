'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

import spreadsData from '../static/toart/json/spreads.json'

interface SpreadDetail {
  name: string
  desc: string
  interpretations: any[]
}

interface SpreadCategory {
  type: string
  route: string
  desc: string
  picture: string
  spreads: SpreadDetail[]
}

export default function QuestionPage() {
  const t = useTranslations('tools.tarot.question')
  const searchParams = useSearchParams()
  const spreadType = searchParams.get('type')

  const [selectedSpread, setSelectedSpread] = useState<SpreadCategory | null>(null)
  const [question, setQuestion] = useState('')

  useEffect(() => {
    // 如果没有type参数，默认使用第一个"常规占卜"
    const defaultType = 'daily'
    const typeToFind = spreadType || defaultType
    const foundSpread = spreadsData.find((s) => s.route === typeToFind) as SpreadCategory | undefined
    setSelectedSpread(foundSpread || null)
  }, [spreadType])

  const handleStartReading = () => {
    // 在这里处理开始占卜的逻辑
    console.log('Question:', question)
    console.log('Spread Type:', selectedSpread?.route)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Card className="border-purple-400/20 bg-black/40 text-white backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold text-purple-400">{t('title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-gray-300">{t('description')}</p>
            <Textarea
              placeholder={t('placeholder')}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[120px] resize-none border-purple-400/30 bg-black/30 text-white placeholder:text-gray-400 focus:ring-purple-400"
            />
            <Button
              onClick={handleStartReading}
              size="lg"
              className="w-full rounded-lg bg-purple-600 text-base text-white hover:bg-purple-700"
            >
              {t('submit')}
            </Button>
          </CardContent>
        </Card>

        {selectedSpread && (
          <div className="mt-12">
            <h2 className="mb-4 text-center text-3xl font-bold text-white">{selectedSpread.type}</h2>
            <p className="mb-8 text-center text-lg text-gray-300">{selectedSpread.desc}</p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {selectedSpread.spreads.map((spread) => (
                <Card
                  key={spread.name}
                  className="flex flex-col border-purple-400/20 bg-black/40 text-white backdrop-blur-md"
                >
                  <CardHeader>
                    <CardTitle className="text-purple-400">{spread.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-300">{spread.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
