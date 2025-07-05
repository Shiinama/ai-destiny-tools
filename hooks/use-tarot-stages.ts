import { useState, useCallback } from 'react'

export type TarotStage = 'shuffle' | 'select' | 'draw'

interface UseTarotStagesProps {
  requiredCards: number
}

export function useTarotStages({ requiredCards }: UseTarotStagesProps) {
  const [currentStage, setCurrentStage] = useState<TarotStage>('shuffle')
  const [selectedCardIndexes, setSelectedCardIndexes] = useState<number[]>([])

  const completeShuffling = useCallback(() => {
    setCurrentStage('select')
  }, [])

  const selectCard = useCallback(
    (cardIndex: number) => {
      setSelectedCardIndexes((prev) => {
        if (prev.includes(cardIndex)) {
          return prev.filter((index) => index !== cardIndex)
        } else if (prev.length < requiredCards) {
          return [...prev, cardIndex]
        }
        return prev
      })
    },
    [requiredCards]
  )

  const completeSelection = useCallback(() => {
    if (selectedCardIndexes.length === requiredCards) {
      setCurrentStage('draw')
    }
  }, [selectedCardIndexes.length, requiredCards])

  const resetToShuffle = useCallback(() => {
    setCurrentStage('shuffle')
    setSelectedCardIndexes([])
  }, [])

  const isCardSelected = useCallback(
    (cardIndex: number) => {
      return selectedCardIndexes.includes(cardIndex)
    },
    [selectedCardIndexes]
  )

  const canCompleteSelection = selectedCardIndexes.length === requiredCards

  return {
    currentStage,
    selectedCardIndexes,
    completeShuffling,
    selectCard,
    completeSelection,
    resetToShuffle,
    isCardSelected,
    canCompleteSelection
  }
}
