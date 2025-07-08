// 塔罗牌相关的全局类型定义

// 塔罗牌会话状态类型
export type TarotSessionStatus = 'created' | 'drawing' | 'completed'

// 导出为全局类型声明
declare global {
  // 塔罗牌会话类型

  interface TarotSession {
    id: string
    userId: string | null
    // 占卜问题信息
    question: string
    spreadName: string
    spreadCategory: string
    spreadDesc: string | null
    reason: string | null // AI推荐理由
    cardCount: number
    spreadLink: string | null
    // 抽牌结果（JSON格式存储）
    cards?: string | null // 存储抽中的卡牌信息
    // AI解读结果
    aiInterpretation?: string | null
    // 占卜状态
    status?: TarotSessionStatus
    // 时间戳
    createdAt?: number
    updatedAt?: number
    completedAt?: number | null
  }

  // 牌阵位置解读接口
  interface SpreadInterpretation {
    position: number
    interpretation: string
  }

  // 单个牌阵配置接口
  interface Spread {
    name: string
    desc: string
    link: string
    count?: number
    interpretations: SpreadInterpretation[][]
  }

  // 牌阵分类接口
  interface SpreadClass {
    type: string
    route: string
    desc: string
    picture: string
    spreads: Spread[]
  }

  // 塔罗牌卡牌接口
  interface CardType {
    name: string
    description: string
    normal: string
    reversed: string
    detail: string
    link: string
  }

  interface CurrentCardType extends CardType {
    position: number
    flipped: boolean
    direction: 'normal' | 'reversed'
    index: number
  }
}

export {}
