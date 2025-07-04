import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

import SpreadList from './components/SpreadList'
// import TopCard from './static/yesorno.webp'

export default function TarotPage() {
  const t = useTranslations('tools.tarot')

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-purple-400 lg:text-5xl">{t('title')}</h1>
        <p className="max-w-xl text-lg text-gray-200">{t('description')}</p>
        <div className="my-4">
          <Image
            src="https://static.destinyai.tools/tarot/card-backs/home_cardbg.png"
            alt="Tarot card"
            width={277}
            height={405}
            className="rounded-lg shadow-lg"
          />
        </div>
        <Link href="/tools/tarot/question">
          <Button
            size="lg"
            className="cursor-pointer rounded-lg bg-purple-600 px-12 text-base text-white hover:bg-purple-700"
          >
            {t('start')}
          </Button>
        </Link>
      </div>
      <div className="mt-24 space-y-20">
        <SpreadList />
      </div>
    </div>
  )
}
