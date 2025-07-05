'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ShuffleCardsProps {
  onShuffleComplete: () => void
}

interface CardTransform {
  x: number
  y: number
  rotation: number
}

export default function ShuffleCards({ onShuffleComplete }: ShuffleCardsProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  const [totalDistance, setTotalDistance] = useState(0)
  const [progress, setProgress] = useState(0)
  const [cardTransforms, setCardTransforms] = useState<CardTransform[]>(
    Array(40)
      .fill(null)
      .map(() => ({ x: 0, y: 0, rotation: 0 }))
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const lastUpdateTime = useRef<number>(0)

  const REQUIRED_DISTANCE = 1000 // 需要移动1000px的距离
  const PROGRESS_THRESHOLD = 100 // 进度达到100%时完成洗牌
  const UPDATE_INTERVAL = 100 // 每100ms更新一次卡牌位置，避免抖动

  // 计算两点之间的距离
  const calculateDistance = useCallback((point1: { x: number; y: number }, point2: { x: number; y: number }) => {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // 处理鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      setIsDragging(true)
      setLastPosition({ x: e.clientX, y: e.clientY })
      setTotalDistance(0)
      setProgress(0)
      lastUpdateTime.current = Date.now()
    }
  }, [])

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const currentPos = { x: e.clientX, y: e.clientY }
      const currentTime = Date.now()

      // 计算移动距离
      const distance = calculateDistance(lastPosition, currentPos)

      // 只有移动距离足够大时才更新
      if (distance > 2) {
        setTotalDistance((prev) => {
          const newDistance = prev + distance
          const newProgress = Math.min((newDistance / REQUIRED_DISTANCE) * 100, 100)
          setProgress(newProgress)
          return newDistance
        })

        // 节流更新卡牌位置，避免抖动
        if (currentTime - lastUpdateTime.current > UPDATE_INTERVAL) {
          setCardTransforms((prev) =>
            prev.map(() => ({
              x: (Math.random() - 0.5) * 300, // 增大位移范围：-150px到150px
              y: (Math.random() - 0.5) * 300, // 增大位移范围：-150px到150px
              rotation: (Math.random() - 0.5) * 240 // 增大旋转范围：-120到120度
            }))
          )
          lastUpdateTime.current = currentTime
        }

        setLastPosition(currentPos)
      }
    },
    [isDragging, lastPosition, calculateDistance]
  )

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)

    // 重置所有卡牌的位置和旋转
    setCardTransforms(
      Array(20)
        .fill(null)
        .map(() => ({ x: 0, y: 0, rotation: 0 }))
    )

    if (progress >= PROGRESS_THRESHOLD) {
      setTimeout(() => {
        onShuffleComplete()
      }, 1000)
    }
  }, [progress, onShuffleComplete])

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-[80vh] cursor-grab flex-col items-center justify-center overflow-hidden"
      onMouseDown={handleMouseDown}
    >
      {/* 洗牌区域 */}
      <div className="relative h-48 w-30 shadow-lg">
        {cardTransforms.map((el, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 h-48 w-30 rounded-lg border-2 border-white/20 bg-gradient-to-br from-blue-600 to-purple-600"
            style={{
              transform: `translate(${cardTransforms[i].x}px, ${cardTransforms[i].y}px) rotate(${cardTransforms[i].rotation}deg)`,
              zIndex: 10 - i,
              transition: isDragging ? 'transform 1s ease-out' : 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundImage: `url(https://static.destinyai.tools/tarot/card-backs/card_bgm.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
        ))}
      </div>

      {/* 说明文字 */}
      <div className="mt-20 text-center text-white">
        <h2 className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-3xl font-bold text-transparent select-none">
          洗牌
        </h2>
        <p className="mb-4 text-xl select-none">请按住鼠标拖动洗牌</p>
      </div>
    </div>
  )
}
