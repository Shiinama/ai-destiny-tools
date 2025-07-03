'use client'

// import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Dialog, DialogContent, DialogPortal, DialogTitle, DialogDescription } from '@/components/ui/dialog'
// import { CardType } from '@/global'

function Card({
  scale,
  index,
  reversed,
  flipped,
  showInfo,
  rotate,
  closeInfo,
  onClick,
  cards
}: {
  scale: {
    x: number
    y: number
  }
  index: number
  reversed: boolean
  flipped: boolean
  showInfo: boolean
  rotate?: number
  closeInfo: () => void
  onClick: () => void
  cards: CardType[]
}) {
  const t = useTranslations('tools.tarot')

  const [curCard, setCurCard] = useState<CardType>({
    link: '',
    name: '',
    description: '',
    normal: '',
    reversed: '',
    detail: ''
  })
  useEffect(() => {
    if (cards && cards[index] && cards[index].link) {
      setCurCard(cards[index])
    }
  }, [cards, index])
  // 用于显示关键词的标签组件
  const KeywordPill = ({ text }: { text: string }) => (
    <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium whitespace-nowrap text-slate-300 transition-colors hover:bg-slate-600">
      {text}
    </span>
  )
  const CardTitle = () => {
    const parts = curCard.name.split(' ')
    const chinese = parts.pop() // "宝剑王后"
    const english = parts.join(' ') // "Queen of Swords"
    return (
      <>
        <DialogTitle className="text-3xl font-bold text-white md:text-4xl">{english}</DialogTitle>
        <p className="mb-6 text-lg text-slate-400">{chinese}</p>
      </>
    )
  }
  return (
    <>
      {/*  */}
      <div
        className={`relative -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-md shadow-md transition-transform duration-500`}
        onClick={onClick}
        style={{
          perspective: '1000px',
          width: scale.x,
          height: scale.y,
          transform: `rotate(${rotate ? rotate : 0}deg)`
        }}
      >
        <div
          className={`absolute inset-0 h-full w-full rounded-md bg-cover bg-center transition-transform duration-500 backface-hidden ${flipped ? 'rotate-y-180' : 'rotate-y-0'} ${flipped ? 'z-10' : 'z-20'}`}
          style={{
            backgroundImage: `url('https://static.destinyai.tools/tarot/card-backs/card_back_4.webp')`
          }}
        ></div>

        <div
          className={`absolute inset-0 h-full w-full rounded-md bg-cover bg-center transition-transform duration-500 backface-hidden ${flipped ? 'rotate-y-0' : '-rotate-y-180'} ${flipped ? 'z-20' : 'z-10'}`}
        >
          {curCard.link && (
            <img src={curCard.link} alt="" className={`h-full w-full ${!reversed ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      <Dialog open={showInfo} onOpenChange={closeInfo}>
        <DialogPortal>
          <DialogContent className="data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out fixed top-1/2 left-1/2 w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-slate-800 p-6 text-slate-200 shadow-2xl focus:outline-none data-[state=closed]:duration-200 data-[state=open]:duration-300 md:p-8">
            {/* 弹窗内容的实际布局容器 */}
            <div className="grid max-h-[80vh] grid-cols-1 gap-x-8 overflow-y-auto md:grid-cols-2">
              {/* 左栏/上方：图片 */}
              <div className="mb-6 w-full md:mb-0">
                <div className="sticky top-0 mx-auto aspect-[4/7] w-full max-w-xs">
                  <img
                    src={curCard.link}
                    alt={curCard.name}
                    className="h-full w-full rounded-xl object-cover shadow-lg shadow-black/40"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.onerror = null
                      target.src = 'https://placehold.co/400x700/1e293b/f1f5f9?text=Image+Not+Found'
                    }}
                  />
                </div>
              </div>

              {/* 右栏/下方：文字内容 */}
              <div className="flex flex-col">
                <CardTitle />

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 font-semibold tracking-wider text-amber-400">{t('desc')}</h3>
                    <DialogDescription className="text-base leading-relaxed text-slate-300">
                      {curCard.description}
                    </DialogDescription>
                  </div>

                  <div>
                    <h3 className="mb-3 font-semibold tracking-wider text-amber-400">{t('upright')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {curCard.normal
                        .split('，')
                        .map((keyword) => keyword && <KeywordPill key={keyword} text={keyword} />)}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 font-semibold tracking-wider text-amber-400">{t('reversed')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {curCard.reversed
                        .split('，')
                        .map((keyword) => keyword && <KeywordPill key={keyword} text={keyword} />)}
                    </div>
                  </div>
                </div>

                {/* <Link
                  href={curCard.detail}
                  key={curCard.name}
                  className="group mt-8 inline-flex items-center gap-2 text-amber-400 transition-colors hover:text-amber-300"
                >
                  {t('detail')}
                  <ExternalLinkIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link> */}
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  )
}

export default Card
