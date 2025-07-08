'use client'

import { Sparkles, Info } from 'lucide-react'
// import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import useInit from '@/hooks/use-init'
import { useRouter } from '@/i18n/navigation'

import Card from './Card'
import CardInfoDialog from './CardInfoDialog'
import InterpretationDialog from './InterpretationDialog'
import QuestionSpreadDialog from './QuestionSpreadDialog'

interface CurrentCardType extends CardType {
  position: number
  flipped: boolean
  direction: 'normal' | 'reversed'
  index: number
}

export default function DrawCard({ slug, sessionData }: { slug: string[]; sessionData: TarotSession }) {
  // const searchParams = useSearchParams()
  const t = useTranslations('tools.tarot')
  const router = useRouter()

  // 传入当前阶段，让useInit决定是否执行初始化逻辑
  const { onCardClick, closeInfo, cardInfos, cardArr, scale, curCard, showInfo } = useInit(slug, sessionData)

  // 弹窗状态管理
  const [isQuestionSpreadDialogOpen, setQuestionSpreadDialogOpen] = useState(false)

  // AI 解读相关状态
  const [isInterpretationOpen, setInterpretationOpen] = useState(false)
  const [interpretationText, setInterpretationText] = useState('')
  const [isInterpreting, setIsInterpreting] = useState(false)

  // 检查是否所有牌都已翻开
  const allFlipped = useMemo(() => {
    if (cardInfos.length) {
      return cardInfos.every((card) => card.flipped)
    }
    return false
  }, [cardInfos])

  // AI解读函数
  async function getInterpretation() {
    // 如果已经解读过，直接展示以往的解读结果，不在调取api
    if (sessionData?.aiInterpretation) {
      setInterpretationText(sessionData.aiInterpretation)
      setInterpretationOpen(true)
      return
    }
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
          spreads: cardInfos,
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
            {cardArr.map(
              (item, index) =>
                cardInfos[index] && (
                  <div key={index} className="absolute h-0 w-0" style={{ top: item.top, left: item.left }}>
                    <Card
                      rotate={item.rotate}
                      scale={scale}
                      curCard={cardInfos[index]}
                      onClick={() => onCardClick(index)}
                    />
                  </div>
                )
            )}
          </div>
        </div>
      </div>
      {/* 卡牌信息 */}
      {curCard && <CardInfoDialog curCard={curCard} showInfo={showInfo} closeInfo={closeInfo} />}
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
        cards={cardInfos}
      />
    </>
  )
}
