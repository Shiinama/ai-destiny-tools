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
          scale = getCardSize(containerWidth, containerHeight, 'tiny', 3, 1, 50)
          arr = [
            { top: `calc(50% - ${scale.y + 5}px)`, left: `50%`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 5}px)`, left: `50%`, scale, rotate: -90 },
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
            { top: `calc(50% - ${scale.y + 20}px)`, left: `calc(50% - ${1.5 * scale.x + 10}px)`, scale, rotate: -45 },
            { top: '50%', left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 20}px)`, left: `calc(50% - ${1.5 * scale.x + 10}px)`, scale, rotate: 45 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 20}px)`, left: `calc(50% + ${1.5 * scale.x + 10}px)`, scale, rotate: -45 },
            { top: '50%', left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 20}px)`, left: `calc(50% + ${1.5 * scale.x + 10}px)`, scale, rotate: 45 }
          ]
          break
        case 'shooting-forward':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 3, 0, 50)
          arr = [
            { top: `calc(50% - ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: '50%', left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 }
          ]
          break
      }
      break
    case 'daily':
      switch (slug[1]) {
        case 'balanced':
          scale = getCardSize(containerWidth, containerHeight, 'large', 2.866, 0.866, 30)
          arr = [
            { top: `calc(50% - ${0.5 * scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${0.5 * scale.y + 10}px)`, left: `calc(50% + ${scale.x + 15}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${0.5 * scale.y + 10}px)`, left: `calc(50% - ${scale.x + 15}px)`, scale, rotate: 0 }
          ]
          break
        case 'celtic-cross':
          scale = getCardSize(containerWidth, containerHeight, 'small', 3, 1, 100)
          const offset = -(20 + 0.5 * scale.x)

          arr = [
            { top: `50%`, left: `calc(${offset}px + 50%)`, scale, rotate: 0 },
            { top: `50%`, left: `calc(${offset}px + 50%)`, scale, rotate: -90 },
            { top: `50%`, left: `calc(${offset - (0.5 * (scale.x + scale.y) + 10)}px + 50%)`, scale, rotate: 0 },
            {
              top: `50%`,
              left: `calc(${offset + (0.5 * (scale.x + scale.y) + 10)}px + 50%)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% - ${scale.y + 10}px)`,
              left: `calc(${offset}px + 50%)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% + ${scale.y + 10}px)`,
              left: `calc(${offset}px + 50%)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% + ${1.5 * scale.y + 3}px)`,
              left: `calc(50% + ${offset + scale.x + scale.y + 30}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% + ${0.5 * scale.y + 1}px)`,
              left: `calc(50% + ${offset + scale.x + scale.y + 30}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% - ${0.5 * scale.y + 1}px)`,
              left: `calc(50% + ${offset + scale.x + scale.y + 30}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% - ${1.5 * scale.y + 3}px)`,
              left: `calc(50% + ${offset + scale.x + scale.y + 30}px)`,
              scale,
              rotate: 0
            }
          ]
          break
        case 'either-or':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 5, 0, 50)
          arr = [
            { top: `calc(50% + ${scale.y + 10}px)`, left: `50%`, scale, rotate: 0 },
            { top: '50%', left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: '50%', left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: `calc(50% - ${2 * (scale.x + 10)}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: `calc(50% + ${2 * (scale.x + 10)}px)`, scale, rotate: 0 }
          ]
          break
        case 'foundation':
          scale = getCardSize(containerWidth, containerHeight, 'large', 3, 0, 50)
          arr = [
            {
              top: `calc(50% + ${0.5 * scale.y + 10}px)`,
              left: `calc(50% - ${0.5 * scale.x + 5}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% + ${0.5 * scale.y + 10}px)`,
              left: `calc(50% + ${0.5 * scale.x + 5}px)`,
              scale,
              rotate: 0
            },
            { top: `calc(50% - ${0.5 * scale.y}px)`, left: '50%', scale, rotate: 0 }
          ]
          break
        case 'linear':
          scale = getCardSize(containerWidth, containerHeight, 'large', 3, 0, 50)
          arr = [
            { top: '50%', left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: '50%', left: '50%', scale, rotate: 0 },
            { top: '50%', left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 }
          ]
          break
        case 'new-years-planning':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 2, 1, 50)
          arr = [
            { top: `calc(50% - ${scale.y + 10}px)`, left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: -90 },
            {
              top: `calc(50% + ${scale.y + 10}px)`,
              left: `calc(50% - ${0.5 * (scale.x + scale.y) + 10}px)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% + ${scale.y + 10}px)`,
              left: `calc(50% + ${0.5 * (scale.x + scale.y) + 10}px)`,
              scale,
              rotate: 0
            },
            { top: '50%', left: '50%', scale, rotate: 0 }
          ]
          break
        case 'single':
          scale = getCardSize(containerWidth, containerHeight, 'xlarge', 1, 0, 50)
          arr = [{ top: `50%`, left: `50%`, scale, rotate: 0 }]
          break
      }
      break
    case 'love-relationship':
      switch (slug[1]) {
        case '3-card':
          scale = getCardSize(containerWidth, containerHeight, 'large', 3, 0, 50)
          arr = [
            { top: '50%', left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: '50%', left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: '50%', left: '50%', scale, rotate: 0 }
          ]
          break
        case '5-card-cross':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 3, 0, 50)
          arr = [
            { top: '50%', left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: '50%', left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: '50%', left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 }
          ]
          break
        case 'broken-heart':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 3, 0, 50)
          arr = [
            { top: `calc(50% - ${0.5 * scale.y + 5}px)`, left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${0.5 * scale.y + 5}px)`, left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${0.5 * scale.y + 5}px)`, left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${0.5 * scale.y + 5}px)`, left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: '50%', left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 }
          ]
          break
        case 'compatibility':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 3, 0, 50)
          arr = [
            { top: `calc(50% - ${0.5 * scale.y + 5}px)`, left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${0.5 * scale.y + 5}px)`, left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${0.5 * scale.y + 5}px)`, left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${0.5 * scale.y + 5}px)`, left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: '50%', left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 }
          ]
          break
        case 'finding-love':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 3, 0, 50)
          arr = [
            { top: '50%', left: '50%', scale, rotate: 0 },
            { top: '50%', left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: '50%', left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 }
          ]
          break
        case 'readiness-for-love':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 3, 0, 50)
          arr = [
            { top: `calc(50% - ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: '50%', left: `calc(50% - ${0.5 * scale.x + 5}px)`, scale, rotate: 0 },
            { top: '50%', left: `calc(50% + ${0.5 * scale.x + 5}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 }
          ]
          break
        case 'stay-or-go':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 3, 0, 50)
          arr = [
            { top: `calc(50% - ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 },
            { top: '50%', left: `calc(50% - ${0.5 * scale.x + 5}px)`, scale, rotate: 0 },
            { top: '50%', left: `calc(50% + ${0.5 * scale.x + 5}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: `calc(50% - ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: `calc(50% + ${scale.x + 10}px)`, scale, rotate: 0 },
            { top: `calc(50% + ${scale.y + 10}px)`, left: '50%', scale, rotate: 0 }
          ]
          break
      }
      break
    case 'spiritual':
      switch (slug[1]) {
        case 'dream-mirror':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 2, 1, 70)
          const offset = -0.25 * (scale.y - scale.x)
          arr = [
            {
              top: `calc(50% - ${0.5 * (scale.y + 10)}px)`,
              left: `calc(${offset - (scale.x + 10)}px + 50%)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% + ${0.5 * (scale.y + 10)}px)`,
              left: `calc(${offset - (scale.x + 10)}px + 50%)`,
              scale,
              rotate: 0
            },
            { top: `calc(50% - ${0.5 * (scale.y + 10)}px)`, left: `calc(${offset}px + 50%)`, scale, rotate: 0 },
            { top: `calc(50% + ${0.5 * (scale.y + 10)}px)`, left: `calc(${offset}px + 50%)`, scale, rotate: 0 },
            {
              top: `calc(50% - ${0.5 * (scale.y + 10)}px)`,
              left: `calc(${-offset + (scale.x + 10)}px + 50%)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% + ${0.5 * (scale.y + 10)}px)`,
              left: `calc(${-offset + (scale.x + 10)}px + 50%)`,
              scale,
              rotate: 0
            },
            {
              top: `calc(50% + ${0.5 * (scale.y + 10)}px)`,
              left: `calc(${-offset + (scale.x + 10)}px + 50%)`,
              scale,
              rotate: -90
            }
          ]
          break
        case 'jungian-archetypes':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 2, 1, 50)
          arr = [
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
            { top: `50%`, left: `50%`, scale, rotate: 0 }
          ]
          break
        case 'self-growth':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 2.4226, 1.4226, 50)
          arr = [
            { top: `calc(50% + ${scale.y + 10}px)`, left: `50%`, scale, rotate: 0 },
            { top: `calc(50% - ${scale.y + 10}px)`, left: `50%`, scale, rotate: 0 },
            { top: '50%', left: '50%', scale, rotate: 0 },
            { top: '50%', left: '50%', scale, rotate: -90 },
            {
              top: `calc(50% - ${1.15 * scale.y}px)`,
              left: `calc(50% - ${scale.x + 0.5 * scale.y}px)`,
              scale,
              rotate: -25
            },
            {
              top: `calc(50% - ${1.15 * scale.y}px)`,
              left: `calc(50% + ${scale.x + 0.5 * scale.y}px)`,
              scale,
              rotate: 25
            },
            { top: `50%`, left: `calc(50% - ${scale.x + 0.5 * scale.y}px)`, scale, rotate: -25 },
            { top: `50%`, left: `calc(50% + ${scale.x + 0.5 * scale.y}px)`, scale, rotate: 25 },
            {
              top: `calc(50% + ${1.15 * scale.y}px)`,
              left: `calc(50% - ${scale.x + 0.5 * scale.y}px)`,
              scale,
              rotate: -25
            },
            {
              top: `calc(50% + ${1.15 * scale.y}px)`,
              left: `calc(50% + ${scale.x + 0.5 * scale.y}px)`,
              scale,
              rotate: 25
            }
          ]
          break
        case 'self-love':
          scale = getCardSize(containerWidth, containerHeight, 'medium', 0.866, 3.2 * 0.866, 30)
          arr = [
            {
              top: `calc(50% - ${0.5 * 1.1 * scale.y}px)`,
              left: `calc(50% - ${Math.sin(Math.PI / 3) * 1.1 * scale.y}px)`,
              scale,
              rotate: -60
            },
            { top: `calc(50% - ${1.1 * scale.y}px)`, left: '50%', scale, rotate: 0 },
            {
              top: `calc(50% - ${0.5 * 1.1 * scale.y}px)`,
              left: `calc(50% + ${Math.sin(Math.PI / 3) * 1.1 * scale.y}px)`,
              scale,
              rotate: 60
            },
            {
              top: `calc(50% + ${0.5 * 1.1 * scale.y}px)`,
              left: `calc(50% + ${Math.sin(Math.PI / 3) * 1.1 * scale.y}px)`,
              scale,
              rotate: -60
            },
            { top: `calc(50% + ${1.1 * scale.y}px)`, left: '50%', scale, rotate: 0 },
            {
              top: `calc(50% + ${0.5 * 1.1 * scale.y}px)`,
              left: `calc(50% - ${Math.sin(Math.PI / 3) * 1.1 * scale.y}px)`,
              scale,
              rotate: 60
            }
          ]
          break
      }
      break

    default:
      break
  }

  return { scale, cardArr: arr }
}

export type { ScaleType, CardArrType, CardPositionConfig }
