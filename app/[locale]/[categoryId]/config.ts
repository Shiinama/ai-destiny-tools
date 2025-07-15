import { getTranslations } from 'next-intl/server'

export const ignoreCategories = ['comprehensive', 'other']

const featureImage: Record<string, { feature1: string; feature2: string; feature3: string }> = {
  tarot: {
    feature1: 'https://static.destinyai.tools/1752412378475-best-online-tarot-reading-cover-image.png',
    feature2: 'https://static.destinyai.tools/1752412373130-discover-top-ai-tarot-readers-cover-image.png',
    feature3: 'https://static.destinyai.tools/1752412376318-master-ai-tarot-interpretation-cover-image.png'
  },
  astrology: {
    feature1: 'https://static.destinyai.tools/1752412503187-explore-astrology-ai-tools-cover-image.png',
    feature2: 'https://static.destinyai.tools/1752412500921-best-astrology-ai-chatbots-cover-image.png',
    feature3: 'https://static.destinyai.tools/1752412500587-free-ai-astrology-readings-cover-image.png'
  },
  vedic: {
    feature1:
      'https://static.destinyai.tools/1752412615151-discover-the-best-vedic-astrology-ai-calculators-cover-image.png',
    feature2: 'https://static.destinyai.tools/1752412613427-uncover-your-destiny-with-ai-tools-cover-image.png',
    feature3: 'https://static.destinyai.tools/1752412612849-find-your-ideal-digital-astrologer-cover-image.png'
  },
  iChing: {
    feature1: 'https://static.destinyai.tools/1752412774046-explore-ai-i-ching-online-cover-image.png',
    feature2: 'https://static.destinyai.tools/1752412775443-accurate-i-ching-hexagrams-cover-image.png',
    feature3: 'https://static.destinyai.tools/1752412773634-free-i-ching-reading-tools-cover-image.png'
  },
  numerology: {
    feature1: 'https://static.destinyai.tools/1752412942999-angel-number-calculator-hub-cover-image.png',
    feature2: 'https://static.destinyai.tools/1752412946661-life-path-number-insights-cover-image.png',
    feature3: 'https://static.destinyai.tools/1752412944949-smart-numerology-calculators-cover-image.png'
  },
  palmistry: {
    feature1: 'https://static.destinyai.tools/1752413087934-explore-top-palmistry-ai-tools-cover-image.png',
    feature2: 'https://static.destinyai.tools/1752413087071-uncover-the-power-of-face-palmistry-cover-image.png',
    feature3: 'https://static.destinyai.tools/1752413087420-compare-palmistry-ai-platforms-cover-image.png'
  },
  dreamInterpretation: {
    feature1: 'https://static.destinyai.tools/1752413199930-interpreter-ai-interpret-cover-image.png',
    feature2: 'https://static.destinyai.tools/1752413196284-ai-dream-interpretation-cover-image.png',
    feature3: 'https://static.destinyai.tools/1752413200546-dream-interpretation-book-cover-image.png'
  }
}

export function getFeatureConfigs(t: Awaited<ReturnType<typeof getTranslations>>, categoryKey: string) {
  if (ignoreCategories.includes(categoryKey)) {
    return []
  }
  return [
    {
      imageUrl: featureImage[categoryKey].feature1,
      imageAlt: t(`${categoryKey}.feature-1.imageAlt` as any),
      title: t(`${categoryKey}.feature-1.title` as any),
      description: t(`${categoryKey}.feature-1.description` as any),
      layout: 'imageLeft' as const
    },
    {
      imageUrl: featureImage[categoryKey].feature2,
      imageAlt: t(`${categoryKey}.feature-2.imageAlt` as any),
      title: t(`${categoryKey}.feature-2.title` as any),
      description: t(`${categoryKey}.feature-2.description` as any),
      layout: 'imageRight' as const
    },
    {
      imageUrl: featureImage[categoryKey].feature3,
      imageAlt: t(`${categoryKey}.feature-3.imageAlt` as any),
      title: t(`${categoryKey}.feature-3.title` as any),
      description: t(`${categoryKey}.feature-3.description` as any),
      layout: 'imageLeft' as const
    }
  ]
}
