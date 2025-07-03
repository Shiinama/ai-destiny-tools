'use client'

// app/layout.tsx

// import { getMessages, getTranslations } from 'next-intl/server' // 导入 getMessages 来加载翻译消息
// import { SymbolIcon, InfoCircledIcon, ArrowLeftIcon } from '@radix-ui/react-icons'
import { useTranslations, useLocale } from 'next-intl'
import { useState, useEffect, useMemo } from 'react'

// import { useCommonData } from '@/components/DataContext'
import InterpretationDialog from './InterpretationDialog'
// import Question from '@/components/Question'
// import SpreadInfo from '@/components/SpreadInfo'
// import { SpreadClass, CardType, Spread } from '@/global'
// import { useRouter } from '@/i18n/navigation'

export default function SpreadsLayout({
  children,
  cardIndexes,
  flipStates,
  reverses,
  onReload,
  cards
}: {
  children: React.ReactNode
  cardIndexes: number[]
  flipStates: boolean[]
  reverses: boolean[]
  onReload: () => void
  cards: any
}) {
  const t = useTranslations('tools.tarot.draw')
  const locale = useLocale()

  const spread: any = {
    name: '',
    guide: '',
    description: '',
    link: ''
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [isQuestionOpen, setIsQuestionOpen] = useState(true)

  const [currentCardInfos, setCurrentCardInfos] = useState<any[]>([])

  const allFlipped = useMemo(() => {
    return currentCardInfos.every((el) => el.flipped)
  }, [currentCardInfos])

  const canInterpret = allFlipped && question.trim() !== ''

  function handleReload() {
    onReload()
    setIsQuestionOpen(true)
    // onQuestionOpen()
    // resetChatBox()
  }

  // function goback() {
  //   router.back()
  // }

  // AI 解读相关状态
  const [isInterpretationOpen, setInterpretationOpen] = useState(false)
  const [interpretationText, setInterpretationText] = useState('')
  const [isInterpreting, setIsInterpreting] = useState(false)

  interface TarotResponse {
    success: boolean
    interpretation?: string
  }

  async function getInterpretation() {
    // return
    if (!canInterpret) return

    setInterpretationText('')
    setIsInterpreting(true)
    setInterpretationOpen(true)
    // console.log('所选牌阵', spread)
    // console.log('翻牌结果', currentCardInfos)
    // console.log('占卜问题', question)

    setIsInterpreting(true)
    try {
      const response = await fetch('/api/tarot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question,
          spreadName: spread.name,
          spreads: currentCardInfos,
          language: locale
        })
      })
      setIsInterpreting(false)
      const data = (await response.json()) as TarotResponse

      if (data.success) {
        setInterpretationText(data.interpretation || '')
      }
    } catch (error) {
      console.error('Error fetching interpretation:', error)
      setInterpretationText('网络或服务器错误，请稍后再试。')
    } finally {
      setIsInterpreting(false)
    }
  }

  useEffect(() => {
    const infos = cardIndexes.map((cardi, posi) => ({
      ...cards[cardi],
      position: posi + 1,

      flipped: flipStates[posi],
      direction: (reverses[posi] ? 'reversed' : 'normal') as 'normal' | 'reversed'
    }))

    setCurrentCardInfos(infos)
  }, [cardIndexes, flipStates, reverses, cards])

  return (
    <>
      {children}
      <div>
        <button
          onClick={getInterpretation}
          disabled={!canInterpret}
          className="cursor-pointer rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-slate-900 shadow-lg transition-all duration-300 hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:bg-slate-600 disabled:opacity-50 md:px-6 md:py-2.5 md:text-base"
        >
          {canInterpret ? '✨ ' + t('answer') : t('answerPlaceholder')}
        </button>
      </div>

      {/* <SpreadInfo noConfirm={true} isOpen={isDialogOpen} content={spread} onClose={() => setIsDialogOpen(false)} /> */}

      <InterpretationDialog
        isOpen={isInterpretationOpen}
        onClose={() => setInterpretationOpen(false)}
        text={interpretationText}
        isLoading={isInterpreting}
      />
    </>
  )
}
