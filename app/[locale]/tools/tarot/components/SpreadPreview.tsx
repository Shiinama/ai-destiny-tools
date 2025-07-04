'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { getCardPositionConfig } from '@/lib/card-pos'

interface SpreadPreviewProps {
  link: string
  name: string
  containerWidth?: number | string
  containerHeight?: number | string
  showCardNumbers?: boolean
}

export default function SpreadPreview({
  link,
  name,
  containerWidth = 300,
  containerHeight = 200,
  showCardNumbers = false
}: SpreadPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [actualDimensions, setActualDimensions] = useState({ width: 300, height: 200 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setActualDimensions({
          width: rect.width || 300,
          height: rect.height || 200
        })
      }
    }

    // 初始计算
    updateDimensions()

    // 监听窗口大小变化（当使用百分比时需要）
    if (typeof containerWidth === 'string' || typeof containerHeight === 'string') {
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [containerWidth, containerHeight])

  const slugArray = link.split('/')
  const config = getCardPositionConfig(slugArray, actualDimensions.width, actualDimensions.height)

  // 计算卡牌的实际显示尺寸 - 更保守的缩放策略
  // getCardSize函数已经处理了防重叠逻辑，我们只需要适度放大
  let scaleFactor = 1.0

  // 只有当卡牌明显过小时才放大
  const cardArea = config.scale.x * config.scale.y
  const containerArea = actualDimensions.width * actualDimensions.height
  const areaRatio = cardArea / containerArea

  if (actualDimensions.width > 500 && areaRatio < 0.002) {
    // 大容器中卡牌面积占比太小时，适度放大
    scaleFactor = 1.4
  } else if (actualDimensions.width > 350 && areaRatio < 0.003) {
    // 中等容器中卡牌面积占比太小时，轻微放大
    scaleFactor = 1.2
  }

  const cardDisplayWidth = config.scale.x * scaleFactor
  const cardDisplayHeight = config.scale.y * scaleFactor

  // 处理容器样式
  const containerStyle: React.CSSProperties = {
    width: containerWidth,
    height: containerHeight,
    minHeight: '120px'
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-900/20 to-blue-900/20"
      style={containerStyle}
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
          <div className="relative">
            <Image
              src="https://static.destinyai.tools/tarot/card-backs/card_bgm.png"
              alt={`${name} 牌阵第${index + 1}张牌`}
              width={cardDisplayWidth}
              height={cardDisplayHeight}
              className="rounded border border-purple-300/30 shadow-lg"
              style={{
                width: `${cardDisplayWidth}px`,
                height: `${cardDisplayHeight}px`
              }}
            />
            {showCardNumbers && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-sm font-bold text-white shadow-lg ring-2 ring-white/30 backdrop-blur-sm">
                  {index + 1}
                </div>
              </div>
            )}
          </div>
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
