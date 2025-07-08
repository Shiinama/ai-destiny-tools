import { useState, useEffect } from 'react'

import cards from '@/app/[locale]/tools/tarot/static/tarot/json/cards.json'
import { getCardPositionConfig, type ScaleType, type CardArrType } from '@/lib/card-pos'

import useElementSize from './use-element-size'

const useInit = (slug: string[], sessionData: TarotSession) => {
  const { width: containerWidth, height: containerHeight } = useElementSize('card_container')

  const [cardArr, setCardArr] = useState<CardArrType[]>([])
  const [scale, setScale] = useState<ScaleType>({ x: 0, y: 0 })
  const [cardInfos, setCardInfos] = useState<CurrentCardType[]>([])
  const [curCard, setCurCard] = useState<CurrentCardType | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    const config = getCardPositionConfig(slug, containerWidth, containerHeight)
    setScale(config.scale)
    setCardArr(config.cardArr)
  }, [slug, containerWidth, containerHeight])

  useEffect(() => {
    if (sessionData && sessionData.cards && sessionData.cards.length > 0) {
      const arr = JSON.parse(sessionData.cards)
      const infos = arr.map((item: CurrentCardType) => ({
        ...cards[item.index],
        position: item.position,
        flipped: item.flipped,
        direction: item.direction,
        index: item.index
      }))
      setCardInfos(infos)
    } else {
      const tempIndexes = Array.from({ length: cards.length }, (_, index) => index)
      const newIndexes: number[] = []
      for (let i = 0; i < cardArr.length; i++) {
        // 防止在卡牌数量多于总牌数时出错
        if (tempIndexes.length === 0) break
        const rand = Math.floor(Math.random() * tempIndexes.length)
        newIndexes.push(tempIndexes.splice(rand, 1)[0])
      }
      const infos = newIndexes.map((cardI, idx) => ({
        ...cards[cardI],
        position: idx + 1,
        flipped: false,
        direction: Math.random() > 0.5 ? 'reversed' : ('normal' as 'normal' | 'reversed'),
        index: cardI
      }))
      setCardInfos(infos)
    }
  }, [sessionData, cardArr.length])

  // function onReload() {
  //   setflipStates(new Array(cardNum).fill(false))
  //   setInfoShown(new Array(cardNum).fill(false))
  //   // shuffleIndexes(cards)
  // }

  function onCardClick(index: number) {
    if (!cardInfos[index].flipped) {
      // 翻牌
      const newArr = cardInfos.map((el, idx) => (idx === index ? { ...el, flipped: true } : el))
      setCardInfos(newArr)
      // 即时保存抽牌结果到数据库，避免用户刷新页面后重复翻牌
      fetch('/api/tarot/session', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionData.id,
          cards: newArr.map((item) => ({
            position: item.position,
            flipped: item.flipped,
            direction: item.direction,
            index: item.index
          }))
        })
      }).catch((error) => console.error('保存抽牌结果失败:', error))
    } else {
      // 查看卡牌详情
      setCurCard(cardInfos[index])
      setShowInfo(true)
    }
  }

  function closeInfo() {
    setShowInfo(false)
  }

  return {
    onCardClick,
    closeInfo,
    cards,
    cardArr,
    scale,
    curCard,
    showInfo,
    cardInfos
  }
}

export default useInit
