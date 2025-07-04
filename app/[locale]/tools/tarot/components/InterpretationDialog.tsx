import { Sparkles, Calendar } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface CurrentCardType extends CardType {
  position: number
  flipped: boolean
  direction: 'normal' | 'reversed'
}

const InterpretationDialog = ({
  isOpen,
  onClose,
  text,
  isLoading,
  cards = []
}: {
  isOpen: boolean
  onClose: () => void
  text: string
  isLoading: boolean
  cards?: CurrentCardType[]
}) => {
  const searchParams = useSearchParams()

  // 从URL参数中获取信息
  const question = searchParams.get('question') ? decodeURIComponent(searchParams.get('question')!) : ''
  const spreadName = searchParams.get('spreadName') ? decodeURIComponent(searchParams.get('spreadName')!) : ''

  // 解析文本，提取主要段落
  const parsedContent = useMemo(() => {
    if (!text) return { title: '', content: [] }

    // 寻找主标题（通常是第一个 ** 包围的内容）
    const titleMatch = text.match(/\*\*([^*]+)\*\*/)
    const mainTitle = titleMatch ? titleMatch[1].trim() : '塔罗解读'

    // 按段落分割内容
    const paragraphs = text
      .replace(/\*\*[^*]+\*\*/g, '') // 移除所有标题标记
      .split('\n\n')
      .filter((p) => p.trim().length > 0)
      .map((p) => p.trim())

    return {
      title: mainTitle,
      content: paragraphs
    }
  }, [text])

  const currentDate = new Date()
    .toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .replace(/\//g, ' / ')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden border-purple-400/30 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white backdrop-blur-xl">
        {/* 顶部标题栏 */}
        <DialogHeader className="relative border-b border-purple-400/20 pb-6">
          <DialogTitle className="flex items-center gap-3 text-3xl font-bold">
            <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI 塔罗解读
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {isLoading && !text ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-purple-500/30"></div>
                <div className="absolute top-0 h-20 w-20 animate-spin rounded-full border-4 border-transparent border-t-purple-500"></div>
                <Sparkles className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-purple-400" />
              </div>
              <p className="mt-6 text-lg text-purple-300">AI正在为您解读塔罗牌的奥秘...</p>
              <p className="mt-2 text-sm text-gray-400">请稍候，智慧正在汇聚</p>
            </div>
          ) : text ? (
            <div className="space-y-6">
              {/* 问题部分 */}
              {question && (
                <div className="rounded-xl border border-purple-400/20 bg-gradient-to-r from-black/40 to-purple-900/20 p-6 backdrop-blur-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-purple-300">您的问题：</h3>
                    <div className="flex items-center gap-1 text-xs text-purple-400">
                      <Calendar className="h-3 w-3" />
                      <span>{currentDate}</span>
                    </div>
                  </div>
                  <p className="text-base leading-relaxed text-gray-200">{question}</p>
                </div>
              )}

              {/* 卡牌展示区域 */}
              {cards.length > 0 && (
                <div className="rounded-xl border border-purple-400/20 bg-gradient-to-r from-black/40 to-purple-900/20 p-6 backdrop-blur-sm">
                  <h3 className="mb-4 text-lg font-semibold text-purple-300">抽到的牌：</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {cards.map((card, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="relative rounded-lg shadow-md">
                          <div className={`relative h-32 w-20 ${card.direction === 'reversed' ? 'rotate-180' : ''}`}>
                            <Image src={card.link} alt={card.name} fill className="object-cover" sizes="80px" />
                          </div>
                          {/* 位置标号 */}
                          <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-bold text-white shadow-lg">
                            {card.position}
                          </div>
                          {/* 逆位标识 */}
                          {card.direction === 'reversed' && (
                            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
                              ↓
                            </div>
                          )}
                        </div>
                        {/* 卡牌名称 */}
                        <p className="mt-2 text-center text-xs text-purple-300">{card.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 解读标题 */}
              <div className="rounded-xl border border-purple-400/20 bg-gradient-to-r from-black/40 to-purple-900/20 p-6 backdrop-blur-sm">
                <h2 className="mb-2 text-2xl font-bold text-purple-200">
                  {parsedContent.title || `${spreadName} - 牌阵解读`}
                </h2>
                <div className="text-sm text-purple-400">AI 深度解读 • 个人专属</div>
              </div>

              {/* 解读内容 */}
              <div className="rounded-xl border border-purple-400/20 bg-gradient-to-r from-black/40 to-purple-900/20 p-6 backdrop-blur-sm">
                <div className="space-y-4">
                  {parsedContent.content.map((paragraph, index) => (
                    <p key={index} className="text-base leading-relaxed text-gray-200">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {isLoading && (
                  <div className="mt-6 flex items-center justify-center gap-3 rounded-lg bg-purple-900/30 p-4">
                    <Sparkles className="h-5 w-5 animate-spin text-purple-400" />
                    <span className="text-purple-300">解读内容正在生成中...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="text-center">
                <Sparkles className="mx-auto h-12 w-12 text-purple-400 opacity-50" />
                <p className="mt-4 text-gray-400">请翻开所有牌后点击解读按钮</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InterpretationDialog
