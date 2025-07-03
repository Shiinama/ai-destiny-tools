import { useState, useEffect, useCallback } from 'react'

import cards from '@/app/[locale]/tools/tarot/static/tarot/json/cards.json'
import { getCardPositionConfig, type ScaleType, type CardArrType } from '@/lib/card-pos'

import useElementSize from './use-element-size'

const useInit = (slug: string[]) => {
  const { width: containerWidth, height: containerHeight } = useElementSize('card_container')

  const [cardArr, setCardArr] = useState<CardArrType[]>([])
  const [cardNum, setCardNum] = useState(0)
  const [scale, setScale] = useState<ScaleType>({ x: 0, y: 0 })
  const [flipStates, setflipStates] = useState<boolean[]>(new Array(cardNum).fill(false))
  const [indexes, setIndexes] = useState<number[]>(new Array(cardNum).fill(0))
  const [reverses, setReverses] = useState<boolean[]>(new Array(cardNum).fill(false))
  const [infoShown, setInfoShown] = useState<boolean[]>(new Array(cardNum).fill(false))

  const shuffleIndexes = useCallback(
    (cardData: CardType[]) => {
      // 如果传入的卡牌数据为空或长度不足，则不执行洗牌
      if (!cardData || cardData.length === 0) {
        return
      }
      const tempIndexes = Array.from({ length: cardData.length }, (_, index) => index)
      const newIndexes: number[] = []
      for (let i = 0; i < cardNum; i++) {
        // 防止在卡牌数量多于总牌数时出错
        if (tempIndexes.length === 0) break
        const rand = Math.floor(Math.random() * tempIndexes.length)
        newIndexes.push(tempIndexes.splice(rand, 1)[0])
      }
      setIndexes(newIndexes)
    },
    [cardNum]
  )

  useEffect(() => {
    const config = getCardPositionConfig(slug, containerWidth, containerHeight)
    setScale(config.scale)
    setCardArr(config.cardArr)
    setCardNum(config.cardArr.length)
    shuffleIndexes(cards)
  }, [slug, containerWidth, containerHeight, shuffleIndexes])

  function onReload() {
    setflipStates(new Array(cardNum).fill(false))
    setInfoShown(new Array(cardNum).fill(false))
    shuffleIndexes(cards)
  }

  function onCardClick(index: number) {
    if (!flipStates[index]) {
      const tempReverses = [...reverses]
      tempReverses[index] = Math.random() > 0.5
      setReverses(tempReverses)

      const tempFlips = [...flipStates]
      tempFlips[index] = true
      setflipStates(tempFlips)
    } else {
      const tempInfo = [...infoShown]
      tempInfo[index] = true
      setInfoShown(tempInfo)
    }
  }

  function closeInfo() {
    setInfoShown(new Array(cardNum).fill(false))
  }

  return {
    indexes,
    flipStates,
    reverses,
    infoShown,
    onReload,
    onCardClick,
    closeInfo,
    cards,
    cardArr,
    scale
  }
}

export default useInit
