'use client'

import { useSearchParams } from 'next/navigation'
import { use, useState } from 'react'

import CardSelection from '../../components/CardSelection'
import DrawCard from '../../components/DrawCard'
import ShuffleCards from '../../components/ShuffleCards'
import StageTransition from '../../components/StageTransition'

// 扩展全局 CardType，添加占卜时需要的额外属性

export default function DrawPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  // console.log('spreadCategory', spreadCategory, spreadDesc)
  const requiredCount = searchParams.get('cardCount')
    ? parseInt(decodeURIComponent(searchParams.get('cardCount')!), 10)
    : 1

  const [currentStage, setCurrentStage] = useState('shuffle')

  // 根据当前阶段渲染不同的内容
  const renderContent = () => {
    switch (currentStage) {
      case 'shuffle':
        return <ShuffleCards onShuffleComplete={() => setCurrentStage('select')} />

      case 'select':
        return <CardSelection requiredCount={requiredCount} onCompleteSelection={() => setCurrentStage('draw')} />

      case 'draw':
        return <DrawCard slug={slug} />
      default:
        return null
    }
  }

  return <StageTransition stage={currentStage}>{renderContent()}</StageTransition>
}
