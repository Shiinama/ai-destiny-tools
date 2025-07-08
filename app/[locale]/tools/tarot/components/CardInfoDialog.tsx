'use client'

// import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { useTranslations } from 'next-intl'

import { Dialog, DialogContent, DialogPortal, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function CardInfo({
  curCard,
  showInfo,
  closeInfo
}: {
  curCard: CardType
  showInfo: boolean
  closeInfo: () => void
}) {
  const t = useTranslations('tools.tarot')

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
    <Dialog open={showInfo} onOpenChange={closeInfo}>
      <DialogPortal>
        <DialogContent className="max-w-3xl overflow-hidden border-purple-400/30 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white backdrop-blur-xl md:p-8">
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
  )
}
