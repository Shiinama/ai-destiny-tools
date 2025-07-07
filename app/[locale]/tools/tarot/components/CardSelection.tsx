'use client'

// import { Circle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CardSelectionProps {
  requiredCount: number
  onCompleteSelection: () => void
}
interface CardTransform {
  rotation: number
  transy: number
}
export default function CardSelection({ requiredCount, onCompleteSelection }: CardSelectionProps) {
  const [selectedCard, setSelectedCard] = useState<number[]>([])
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const [cards, setCards] = useState<CardTransform[]>(
    Array(78)
      .fill(null)
      .map(() => ({ rotation: 0, transy: 0 }))
  )

  // 计算扇形布局的角度
  const calculateFanRotation = (index: number, total: number) => {
    const fanAngle = 180 // 扇形总角度
    const startAngle = -fanAngle / 2 // 起始角度
    return (startAngle + (index / (total - 1)) * fanAngle) * 0.3
  }

  // 依次展开卡牌动画
  useEffect(() => {
    const expandCards = () => {
      cards.forEach((_, index) => {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === index
                ? {
                    rotation: calculateFanRotation(index, 78),
                    transy: 0
                  }
                : card
            )
          )
        }, index * 20) // 每20ms展开一张牌
      })
    }

    expandCards()
  }, [])

  const [isComplete, setIsComplete] = useState(false)
  useEffect(() => {
    if (requiredCount && selectedCard.length === requiredCount) {
      setIsComplete(true)
      setTimeout(() => {
        onCompleteSelection()
      }, 1000)
    }
  }, [selectedCard, onCompleteSelection, requiredCount])

  const selectCard = (index: number) => {
    if (selectedCard.includes(index)) return // 防止重复选择
    if (selectedCard.length === requiredCount) return
    setCards((prev) => prev.map((card, i) => (i === index ? { ...card, transy: -110 } : card)))
    setSelectedCard([...selectedCard, index])
  }

  const handleMouseEnter = (index: number) => {
    if (selectedCard.includes(index)) return // 已选中的卡牌不响应悬停

    setHoveredCard(index)
    setCards((prev) => prev.map((card, i) => (i === index ? { ...card, transy: -10 } : card)))
  }

  const handleMouseLeave = (index: number) => {
    if (selectedCard.includes(index)) return // 已选中的卡牌不响应悬停

    setHoveredCard(null)
    setCards((prev) => prev.map((card, i) => (i === index ? { ...card, transy: 0 } : card)))
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="relative h-48 w-30">
        {cards.map((el, i) => (
          <div
            onClick={() => selectCard(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={() => handleMouseLeave(i)}
            key={i}
            className="absolute top-0 left-0 h-48 w-30 cursor-pointer rounded-lg border-2 shadow-lg"
            style={{
              zIndex: i,
              transformOrigin: `50% 500%`,
              transform: `rotate(${el.rotation}deg) translateY(${el.transy}%)`,
              transition: 'transform 0.3s ease',
              backgroundImage: `url(https://static.destinyai.tools/tarot/card-backs/card_bgm.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
        ))}
      </div>
      <div className="mt-8 select-none">需要选中{requiredCount}张牌</div>
      <p className="mt-4 h-[30px] animate-pulse text-xl font-bold text-yellow-400">
        {isComplete ? '✨ 选牌完成！正在进入翻牌牌环节...' : ''}
      </p>
    </div>
  )
}
