'use client'

import { useSearchParams } from 'next/navigation'
import { use, useEffect, useState } from 'react'

import CardSelection from '../../components/CardSelection'
import DrawCard from '../../components/DrawCard'
import ShuffleCards from '../../components/ShuffleCards'
import StageTransition from '../../components/StageTransition'

// 扩展全局 CardType，添加占卜时需要的额外属性

export default function DrawPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = use(params)
  const searchParams = useSearchParams()

  const sessionId = searchParams.get('sessionId')

  const [tarorSession, setTarorSession] = useState<TarotSession | null>(null)

  useEffect(() => {
    async function getTarorSession() {
      const response = await fetch(`/api/tarot/session?id=${sessionId}`)
      const data: TarotSession = await response.json()
      setTarorSession(data)
      if (data.cards && data.cards.length) {
        // 用户已翻牌
        setCurrentStage('draw')
        // 将翻牌信息写入组件
      }
    }
    getTarorSession()
  }, [sessionId])

  const [currentStage, setCurrentStage] = useState('shuffle')

  // 根据当前阶段渲染不同的内容
  const renderContent = () => {
    switch (currentStage) {
      case 'shuffle':
        return <ShuffleCards onShuffleComplete={() => setCurrentStage('select')} />

      case 'select':
        return (
          <CardSelection
            requiredCount={tarorSession?.cardCount || 1}
            onCompleteSelection={() => setCurrentStage('draw')}
          />
        )

      case 'draw':
        return tarorSession ? <DrawCard slug={slug} sessionData={tarorSession} /> : null
      default:
        return null
    }
  }

  return <StageTransition stage={currentStage}>{renderContent()}</StageTransition>
}
