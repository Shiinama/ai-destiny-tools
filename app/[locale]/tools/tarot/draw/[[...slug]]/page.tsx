'use client'

import { use, useState, useMemo } from 'react'

import CardSelection from '../../components/CardSelection'
import DrawCard from '../../components/DrawCard'
import ShuffleCards from '../../components/ShuffleCards'
import StageTransition from '../../components/StageTransition'

// 扩展全局 CardType，添加占卜时需要的额外属性

export default function DrawPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = use(params)

  // console.log('spreadCategory', spreadCategory, spreadDesc)

  const [currentStage, setCurrentStage] = useState('shuffle')

  // 计算所需卡牌数量，不依赖于cardArr
  const requiredCount = useMemo(() => {
    // 从slug中解析出所需的卡牌数量
    if (!slug || slug.length === 0) return 1

    // 根据不同的牌阵类型返回不同的数量
    const spreadType = slug[0]
    switch (spreadType) {
      case 'single':
        return 1
      case 'three':
        return 3
      case 'celtic':
        return 10
      case 'love':
        return 7
      case 'career':
        return 5
      default:
        return 1
    }
  }, [slug])

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
