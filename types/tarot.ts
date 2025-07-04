// 塔罗牌相关的全局类型定义

// 牌阵位置解读接口
interface SpreadInterpretation {
  position: number
  interpretation: string
}

// 单个牌阵配置接口
export interface Spread {
  name: string
  guide: string
  desc: string
  link: string
  interpretations: SpreadInterpretation[][]
}

// 牌阵分类接口
export interface SpreadClass {
  type: string
  route: string
  desc: string
  picture: string
  spreads: Spread[]
}

// 塔罗牌卡牌接口
export interface CardType {
  name: string
  description: string
  normal: string
  reversed: string
  detail: string
  link: string
}

// 导出为全局类型声明
declare global {
  interface Spread {
    name: string
    guide: string
    desc: string
    link: string
    interpretations: SpreadInterpretation[][]
  }

  interface SpreadClass {
    type: string
    route: string
    desc: string
    picture: string
    spreads: Spread[]
  }

  interface CardType {
    name: string
    description: string
    normal: string
    reversed: string
    detail: string
    link: string
  }

  interface SpreadInterpretation {
    position: number
    interpretation: string
  }
}

export {}
