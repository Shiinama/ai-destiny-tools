'use client'

import { use } from 'react'

import useInit from '@/hooks/use-init'

import Card from '../../components/Card'
import SpreadsBox from '../../components/SpreadsBox'

// import useCardSize from '@/hooks/useCardSize'

export default function DrawPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = use(params)

  const { scale, cardArr, indexes, flipStates, reverses, infoShown, onReload, onCardClick, closeInfo, cards } =
    useInit(slug)
  // console.log(scale, cardArr)

  return (
    <div className="relative min-h-[80vh] w-full" id="card_container">
      <SpreadsBox cards={cards} onReload={onReload} cardIndexes={indexes} flipStates={flipStates} reverses={reverses}>
        {cardArr.map((item, index) => (
          <div key={index} className="absolute h-0 w-0" style={{ top: item.top, left: item.left }}>
            <Card
              cards={cards}
              scale={scale}
              rotate={item.rotate}
              index={indexes[index]}
              flipped={flipStates[index]}
              reversed={reverses[index]}
              showInfo={infoShown[index]}
              closeInfo={closeInfo}
              onClick={() => onCardClick(index)}
            />
          </div>
        ))}
      </SpreadsBox>
    </div>
  )
}
