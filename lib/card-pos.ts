import getCardSize from './card-size'

interface ScaleType {
  x: number
  y: number
}

interface CardArrType {
  top: string
  left: string
  scale: ScaleType
  rotate: number
}

interface CardPositionConfig {
  scale: ScaleType
  cardArr: CardArrType[]
}

export function getCardPositionConfig(
  slug: string[],
  containerWidth: number,
  containerHeight: number
): CardPositionConfig {
  let scale: ScaleType = { x: 0, y: 0 }
  let arr: CardArrType[] = []

  switch (slug[0]) {
    case 'career':
      switch (slug[1]) {
        case 'brick-by-brick':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 3, 0, 50)
          arr = [
            { top: `calc(50% + ${scale.y + 10}px)`, left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: '50%', left: `calc(50% - ${0.5 * scale.x + 5}px)`, scale, rotate: 0 },
            { top: '50%', left: `calc(50% + ${0.5 * scale.x + 5}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 }
          ]
          break
        case 'business-strategy':
          scale = getCardSize(containerWidth, containerHeight, 'xlarge', 1, 0, 50)
          arr = [
            { top: `calc(50% - ${scale.y + 5}px)`, left: `50%`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 5}px)`, left: `50%`, scale, rotate: 0 },
            { top: `calc(50% - ${2 * (scale.y + 5)}px)`, left: `50%`, scale, rotate: 0 },
            {
              top: `calc(50% - ${1.5 * (scale.y + 5)}px)`,
              left: `calc(50% - ${0.5 * (scale.x + scale.y) + 10}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% - ${1.5 * (scale.y + 5)}px)`,
              left: `calc(50% + ${0.5 * (scale.x + scale.y) + 10}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% - ${scale.y + 5}px)`,
              left: `calc(50% - ${scale.x + 0.5 * scale.y + 10}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% - ${scale.y + 5}px)`,
              left: `calc(50% + ${scale.x + 0.5 * scale.y + 10}px)`,
              scale,
              rotate: 0
            },
            { top: '50%', left: `50%`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 5}px)`, left: `50%`, scale, rotate: 0 },
            { top: `calc(50% + ${2 * (scale.y + 5)}px)`, left: `50%`, scale, rotate: 0 }
          ]
          break
        case 'facing-challenges':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 2, 1, 50)
          arr = [
            { top: `50%`, left: '50%', scale, rotate: 0 },
            { top: `50%`, left: '50%', scale, rotate: -90 },
            { top: `50%`, left: `calc(50% - ${0.5 * scale.x + 0.5 * scale.y + 10}px)`, scale, rotate: 0 },
            { top: `50%`, left: `calc(50% + ${0.5 * scale.x + 0.5 * scale.y + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: `50%`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: `50%`, scale, rotate: 0 }
          ]
          break
        case 'job-search':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 2, 1, 50)
          arr = [
            { top: `50%`, left: `50%`, scale, rotate: -90 },
            { top: `50%`, left: `50%`, scale, rotate: 0 },
            {
              top: `calc(50% - ${0.5 * scale.x + 0.5 * scale.y + 10}px)`,
              left: `calc(50% - ${0.5 * scale.x + 0.5 * scale.y + 10}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% - ${0.5 * scale.x + 0.5 * scale.y + 10}px)`,
              left: `calc(50% + ${0.5 * scale.x + 0.5 * scale.y + 10}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% + ${0.5 * scale.x + 0.5 * scale.y + 10}px)`,
              left: `calc(50% - ${0.5 * scale.x + 0.5 * scale.y + 10}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% + ${0.5 * scale.x + 0.5 * scale.y + 10}px)`,
              left: `calc(50% + ${0.5 * scale.x + 0.5 * scale.y + 10}px)`,
              scale,
              rotate: 0
            }
          ]
          break
        case 'mind-and-heart':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 3, 0, 50)
          arr = [
            { top: `calc(50% - ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: `calc(50% - ${0.5 * scale.y + 5}px)`, left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${0.5 * scale.y + 5}px)`, left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${0.5 * scale.y + 5}px)`, left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${0.5 * scale.y + 5}px)`, left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 }
          ]
          break
        case 'self-alignment':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 2.414, 1.414, 50)
          arr = [
            { top: `50%`, left: `50%`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 20}px)`, left: `calc(50% - ${1.5 * scale.x + 10}px)`, scale, rotate: 0 },
            { top: '50%', left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 20}px)`, left: `calc(50% - ${1.5 * scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 20}px)`, left: `calc(50% + ${1.5 * scale.x + 10}px)`, scale, rotate: -45 },
            { top: '50%', left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 20}px)`, left: `calc(50% + ${1.5 * scale.x + 10}px)`, scale, rotate: 45 }
          ]
          break
        case 'single':
          scale = getCardSize(containerWidth, containerHeight, 'xlarge', 1, 0, 50)
          arr = [{ top: `50%`, left: `50%`, scale, rotate: 0 }]
          break
      }
      break
    case 'daily':
      switch (slug[1]) {
        case 'single':
          scale = getCardSize(containerWidth, containerHeight, 'xlarge', 1, 0, 50)
          arr = [{ top: `50%`, left: `50%`, scale, rotate: 0 }]
          break
        case 'brick-by-brick':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 3, 0, 50)
          arr = [
            { top: `calc(50% + ${scale.y + 10}px)`, left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: '50%', left: `calc(50% - ${0.5 * scale.x + 5}px)`, scale, rotate: 0 },
            { top: '50%', left: `calc(50% + ${0.5 * scale.x + 5}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 }
          ]
          break
        case 'business-strategy':
          scale = getCardSize(containerWidth, containerHeight, 'xlarge', 1, 0, 50)
          arr = [
            { top: `calc(50% - ${scale.y + 5}px)`, left: `50%`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 5}px)`, left: `50%`, scale, rotate: 0 },
            { top: `calc(50% - ${2 * (scale.y + 5)}px)`, left: `50%`, scale, rotate: 0 },
            {
              top: `calc(50% - ${1.5 * (scale.y + 5)}px)`,
              left: `calc(50% - ${0.5 * (scale.x + scale.y) + 10}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% - ${1.5 * (scale.y + 5)}px)`,
              left: `calc(50% + ${0.5 * (scale.x + scale.y) + 10}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% - ${scale.y + 5}px)`,
              left: `calc(50% - ${scale.x + 0.5 * scale.y + 10}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% - ${scale.y + 5}px)`,
              left: `calc(50% + ${scale.x + 0.5 * scale.y + 10}px)`,
              scale,
              rotate: 0
            },
            { top: '50%', left: `50%`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 5}px)`, left: `50%`, scale, rotate: 0 },
            { top: `calc(50% + ${2 * (scale.y + 5)}px)`, left: `50%`, scale, rotate: 0 }
          ]
          break
        case 'single':
          scale = getCardSize(containerWidth, containerHeight, 'xlarge', 1, 0, 50)
          arr = [{ top: `50%`, left: `50%`, scale, rotate: 0 }]
          break
      }
      break
    default:
      break
  }

  return { scale, cardArr: arr }
}

export type { ScaleType, CardArrType, CardPositionConfig }
