'use client'

import { Sparkles, Info } from 'lucide-react'
// import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useMemo, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import useInit from '@/hooks/use-init'
import { useRouter } from '@/i18n/navigation'

import Card from './Card'
import InterpretationDialog from './InterpretationDialog'
import QuestionSpreadDialog from './QuestionSpreadDialog'

interface CurrentCardType extends CardType {
  position: number
  flipped: boolean
  direction: 'normal' | 'reversed'
}

export default function DrawCard({ slug, sessionData }: { slug: string[]; sessionData: TarotSession }) {
  // const searchParams = useSearchParams()
  const t = useTranslations('tools.tarot')
  const router = useRouter()

  // 从URL参数中获取sessionId或传统参数信息
  // const sessionId = searchParams.get('sessionId')
  // const [sessionData, setSessionData] = useState<any>(null)

  // // 传统方式的参数（作为fallback）
  // const question = searchParams.get('question') ? decodeURIComponent(searchParams.get('question')!) : ''
  // const spreadName = searchParams.get('spreadName') ? decodeURIComponent(searchParams.get('spreadName')!) : ''
  // const spreadCategory = searchParams.get('spreadCategory')
  //   ? decodeURIComponent(searchParams.get('spreadCategory')!)
  //   : ''
  // const spreadDesc = searchParams.get('spreadDesc') ? decodeURIComponent(searchParams.get('spreadDesc')!) : ''
  // const reason = searchParams.get('reason') ? decodeURIComponent(searchParams.get('reason')!) : ''

  // 获取会话数据
  // useEffect(() => {
  //   if (sessionId) {
  //     fetch(`/api/tarot/session?id=${sessionId}`)
  //       .then((res) => res.json())
  //       .then((data) => setSessionData(data))
  //       .catch((error) => console.error('获取会话数据失败:', error))
  //   }
  // }, [sessionId])

  // 传入当前阶段，让useInit决定是否执行初始化逻辑
  const { scale, cardArr, indexes, flipStates, reverses, infoShown, onReload, onCardClick, closeInfo, cards } =
    useInit(slug)

  // 弹窗状态管理
  const [isQuestionSpreadDialogOpen, setQuestionSpreadDialogOpen] = useState(false)

  // AI 解读相关状态
  const [isInterpretationOpen, setInterpretationOpen] = useState(false)
  const [interpretationText, setInterpretationText] = useState('')
  const [isInterpreting, setIsInterpreting] = useState(false)
  const [currentCardInfos, setCurrentCardInfos] = useState<CurrentCardType[]>([])

  // 检查是否所有牌都已翻开
  const allFlipped = useMemo(() => {
    if (currentCardInfos.length) {
      return currentCardInfos.every((card) => card.flipped)
    }
    return false
  }, [currentCardInfos])

  // 更新当前卡牌信息（从SpreadsBox移动过来）
  useEffect(() => {
    const infos = indexes.map((cardi, posi) => ({
      ...cards[cardi],
      position: posi + 1,
      flipped: flipStates[posi],
      direction: (reverses[posi] ? 'reversed' : 'normal') as 'normal' | 'reversed'
    }))

    setCurrentCardInfos(infos)

    // 当所有牌都翻开后，保存抽牌结果到数据库
    if (infos.length > 0 && infos.every((card) => card.flipped) && sessionData?.id) {
      fetch('/api/tarot/session', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionData.id,
          cards: infos
        })
      }).catch((error) => console.error('保存抽牌结果失败:', error))
    }
  }, [indexes, flipStates, reverses, cards, sessionData?.id])

  // AI解读函数
  async function getInterpretation() {
    setInterpretationText('')
    setIsInterpreting(true)
    setInterpretationOpen(true)

    try {
      const response = await fetch('/api/tarot/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: sessionData?.question,
          spreadName: sessionData?.spreadName,
          spreads: currentCardInfos,
          spreadDesc: sessionData?.spreadDesc
        })
      })

      if (!response.ok) {
        throw new Error('网络请求失败')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)

            if (data === '[DONE]') {
              setIsInterpreting(false)

              // 更新会话中的AI解读结果
              if (accumulated) {
                fetch('/api/tarot/session', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    sessionId: sessionData.id,
                    aiInterpretation: accumulated
                  })
                }).catch((error) => console.error('更新AI解读结果失败:', error))
              }

              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                accumulated += parsed.text
                setInterpretationText(accumulated)
              } else if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch (e) {
              // 忽略JSON解析错误，继续处理下一行
            }
          }
        }
      }

      setIsInterpreting(false)
    } catch (error) {
      console.error('解读失败:', error)
      setInterpretationText('抱歉，解读过程中出现错误，请稍后再试。')
      setIsInterpreting(false)
    }
  }

  // 处理AI解读按钮点击
  const handleAIInterpretation = () => {
    getInterpretation()
  }

  // 处理AI解读弹窗关闭，跳转回塔罗牌首页
  const handleInterpretationClose = () => {
    setInterpretationOpen(false)
    router.replace('/tools/tarot')
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* 顶部按钮区域 */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setQuestionSpreadDialogOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl"
              size="lg"
            >
              <Info className="h-5 w-5" />
              占卜信息
            </Button>

            <Button
              onClick={handleAIInterpretation}
              disabled={!allFlipped}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transition-all duration-300 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600 disabled:opacity-50"
              size="lg"
            >
              <Sparkles className="h-5 w-5" />
              {allFlipped ? '✨ AI 解读' : '请翻开所有牌'}
            </Button>
          </div>

          {/* 翻牌区域 */}
          <div className="relative min-h-[80vh] w-full" id="card_container">
            {cardArr.map((item, index) => (
              <div key={index} className="absolute h-0 w-0" style={{ top: item.top, left: item.left }}>
                <Card
                  cards={cards}
                  scale={scale}
                  rotate={item.rotate}
                  index={indexes[index]}
                  flipped={flipStates[index]}
                  reversed={reverses[index]}
                  showInfo={infoShown[index]}
                  closeInfo={closeInfo}
                  onClick={() => onCardClick(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 问题和牌阵信息弹窗 */}
      <QuestionSpreadDialog
        isOpen={isQuestionSpreadDialogOpen}
        onClose={() => setQuestionSpreadDialogOpen(false)}
        question={sessionData?.question}
        spreadName={sessionData?.spreadName}
        spreadCategory={sessionData?.spreadCategory}
        spreadDesc={sessionData?.spreadDesc || ''}
        reason={sessionData?.reason || ''}
      />

      {/* AI解读弹窗 */}
      <InterpretationDialog
        isOpen={isInterpretationOpen}
        onClose={handleInterpretationClose}
        text={interpretationText}
        isLoading={isInterpreting}
        cards={currentCardInfos}
      />
    </>
  )
}
