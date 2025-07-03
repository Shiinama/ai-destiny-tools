'use client'

import Image from 'next/image'

import { getCardPositionConfig } from '@/lib/card-pos'

interface SpreadPreviewProps {
  link: string
  name: string
  containerWidth?: number
  containerHeight?: number
}

export default function SpreadPreview({ link, name, containerWidth = 300, containerHeight = 200 }: SpreadPreviewProps) {
  const slugArray = link.split('/')
  const config = getCardPositionConfig(slugArray, containerWidth, containerHeight)

  // 计算卡牌的实际显示尺寸
  const cardDisplayWidth = Math.min(config.scale.x * 0.6, 24)
  const cardDisplayHeight = Math.min(config.scale.y * 0.6, 40)

  return (
    <div
      className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-900/20 to-blue-900/20"
      style={{
        width: containerWidth,
        height: containerHeight,
        minHeight: '120px'
      }}
    >
      {config.cardArr.map((cardPos, index) => (
        <div
          key={index}
          className="absolute transition-all duration-300 hover:scale-110"
          style={{
            top: cardPos.top,
            left: cardPos.left,
            transform: `translate(-50%, -50%) rotate(${cardPos.rotate || 0}deg)`,
            zIndex: index + 1
          }}
        >
          <Image
            src="https://static.destinyai.tools/tarot/card-backs/card_back_4.webp"
            alt={`${name} 牌阵第${index + 1}张牌`}
            width={cardDisplayWidth}
            height={cardDisplayHeight}
            className="rounded-sm border border-purple-300/30 shadow-lg"
            style={{
              width: `${cardDisplayWidth}px`,
              height: `${cardDisplayHeight}px`
            }}
          />
        </div>
      ))}

      {/* 牌阵信息叠加层 */}
      {/* <div className="absolute right-2 bottom-2 left-2">
        <div className="rounded bg-black/50 px-2 py-1 text-xs text-white/80 backdrop-blur-sm">
          {config.cardArr.length} 张牌
        </div>
      </div> */}
    </div>
  )
}
