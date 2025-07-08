// import { CardType } from '@/global'

function Card({
  scale,
  rotate,
  onClick,
  curCard
}: {
  scale: {
    x: number
    y: number
  }
  rotate?: number
  curCard: CurrentCardType
  onClick: () => void
}) {
  return (
    <>
      <div
        className={`relative -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-md shadow-md transition-transform duration-500`}
        onClick={onClick}
        style={{
          perspective: '1000px',
          width: scale.x,
          height: scale.y,
          transform: `rotate(${rotate ? rotate : 0}deg)`
        }}
      >
        <div
          className={`absolute inset-0 h-full w-full rounded-md border-2 bg-cover bg-center shadow-lg transition-transform duration-500 backface-hidden ${curCard.flipped ? 'rotate-y-180' : 'rotate-y-0'} ${curCard.flipped ? 'z-10' : 'z-20'}`}
          style={{
            backgroundImage: `url('https://static.destinyai.tools/tarot/card-backs/card_bgm.png')`
          }}
        ></div>

        <div
          className={`absolute inset-0 h-full w-full rounded-md bg-cover bg-center transition-transform duration-500 backface-hidden ${curCard.flipped ? 'rotate-y-0' : '-rotate-y-180'} ${curCard.flipped ? 'z-20' : 'z-10'}`}
        >
          {curCard.link && (
            <img
              src={curCard.link}
              alt=""
              className={`h-full w-full ${curCard.direction === 'reversed' ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default Card
