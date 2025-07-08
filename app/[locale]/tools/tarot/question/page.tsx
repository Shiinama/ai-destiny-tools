'use client'

import { Heart, Briefcase, Sparkles, Compass, Star, HelpCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { recommendTarotSpread } from '@/actions/tarot'
import LoginForm from '@/components/login/login-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from '@/i18n/navigation'

import SpreadInfo from '../components/SpreadInfo'
import SpreadPreview from '../components/SpreadPreview'
import spreadsData from '../static/tarot/json/spreads.json'

interface SpreadRecommendation {
  spreadType: string
  spreadCategory: string
  spreadName: string
  spreadDesc: string
  spreadLink?: string
  cardCount: number
  reason: string
}

const categoryIcons = {
  daily: <Compass className="h-4 w-4" />,
  career: <Briefcase className="h-4 w-4" />,
  'love-relationship': <Heart className="h-4 w-4" />,
  spiritual: <Sparkles className="h-4 w-4" />
}

export default function QuestionPage() {
  const router = useRouter()

  const t = useTranslations('tools.tarot')
  const common = useTranslations('common')
  const searchParams = useSearchParams()
  const spreadType = searchParams.get('type')
  const [activeTab, setActiveTab] = useState('daily')
  const [question, setQuestion] = useState('')
  const [isRecommending, setIsRecommending] = useState(false)
  const [recommendation, setRecommendation] = useState<SpreadRecommendation | null>(null)
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null)
  const { data: session } = useSession()
  const [isLogin, setIsLogin] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    setIsLogin(!!session?.user?.id)
  }, [session])

  const maxLength = 500
  const remainingChars = maxLength - question.length

  useEffect(() => {
    // 如果没有type参数，默认使用第一个"常规占卜"
    const defaultType = 'daily'
    const typeToFind = spreadType || defaultType
    setActiveTab(typeToFind)
  }, [spreadType])

  const handleRecommendSpread = async () => {
    if (!session?.user?.id) {
      // 打开登录弹窗
      setIsLoginModalOpen(true)
      return
    }

    if (!question.trim()) return

    setIsRecommending(true)
    try {
      const result = await recommendTarotSpread(question)
      setRecommendation(result)
      setShowRecommendation(true)
    } catch (error) {
      console.error('推荐失败:', error)
    } finally {
      setIsRecommending(false)
    }
  }

  const createTarotSession = async (formData: {
    spreadName: string
    spreadCategory: string
    spreadDesc: string
    reason: string
    cardCount: number
    spreadLink: string
  }) => {
    if (!session?.user?.id) {
      // 显示登录提示或跳转到登录页面
      return
    }

    const response = await fetch('/api/tarot/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...formData, question, userId: session.user.id })
    })
    if (!response.ok) {
      throw new Error('创建会话失败')
    }

    const result = (await response.json()) as { id: string }
    const sessionId = result.id

    // 跳转到翻牌页面，传递sessionId
    router.push(`draw/${formData.spreadLink}?sessionId=${sessionId}`)
  }

  const startDraw = async () => {
    if (recommendation) {
      createTarotSession({
        spreadName: recommendation.spreadName,
        spreadCategory: recommendation.spreadCategory,
        spreadDesc: recommendation.spreadDesc || '',
        reason: recommendation.reason || '',
        cardCount: recommendation.cardCount || 1,
        spreadLink: recommendation.spreadLink || ''
      })
    }
  }

  const handleSpreadSelect = async (spreadItem: Spread) => {
    createTarotSession({
      spreadName: spreadItem.name,
      spreadCategory: activeTab,
      spreadDesc: spreadItem.desc || '',
      reason: '',
      cardCount: spreadItem.count || spreadItem.interpretations[0]?.length || 1,
      spreadLink: spreadItem.link
    })
  }

  const reSelectSpread = () => {
    setShowRecommendation(false)
    // setRecommendation(null)
  }

  const handleSpreadInfo = (spread: Spread) => {
    setSelectedSpread(spread)
    setIsDialogOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* 顶部问题输入区域 */}
        {!recommendation && (
          <Card className="border-purple-400/20 bg-black/40 text-white backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-center text-3xl font-bold text-purple-400">选择您的塔罗牌阵</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-gray-300">输入您想占卜的问题，AI将为您推荐最适合的牌阵</p>
              <div className="space-y-2">
                <Textarea
                  placeholder="请描述您想占卜的问题，例如：我在工作上遇到困难..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={maxLength}
                  className="min-h-[120px] resize-none border-purple-400/30 bg-black/30 text-white placeholder:text-gray-400 focus:ring-purple-400"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span></span>
                  <span className={remainingChars < 50 ? 'text-orange-400' : ''}>
                    {question.length}/{maxLength}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleRecommendSpread}
                disabled={(isLogin && !question.trim()) || isRecommending}
                size="lg"
                className={`w-full cursor-pointer rounded-lg text-base text-white transition-all duration-300 disabled:opacity-50 ${
                  !isLogin
                    ? 'relative animate-pulse overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 shadow-lg shadow-purple-500/50 before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-700 hover:scale-[1.02] hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 hover:shadow-xl hover:shadow-purple-500/70 hover:before:translate-x-[100%]'
                    : 'bg-purple-600 hover:bg-purple-700'
                } `}
              >
                <span className={!isLogin ? 'relative z-10' : ''}>
                  {!isLogin ? '登录后开启占卜之旅' : isRecommending ? '正在分析问题...' : '输入问题获取AI推荐牌阵'}
                </span>
              </Button>
            </CardContent>
          </Card>
        )}
        {/* AI推荐结果 */}
        {showRecommendation && recommendation && (
          <Card className="mx-auto max-w-[900px] border-amber-400/30 bg-gradient-to-r from-amber-900/20 to-orange-900/20 text-white backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-xl text-amber-400">AI 智能推荐</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1">
                    {categoryIcons[recommendation.spreadType as keyof typeof categoryIcons]}
                    <span className="text-sm font-medium">
                      {spreadsData.find((s: any) => s.route === recommendation.spreadType)?.type}
                    </span>
                  </div>
                  <span className="text-amber-300">推荐牌阵: {recommendation.spreadName}</span>
                </div>
                <p className="leading-relaxed text-gray-200">{recommendation.reason}</p>

                <div className="flex justify-center">
                  <SpreadPreview
                    link={recommendation.spreadLink || ''}
                    name={recommendation.spreadName}
                    containerWidth={400}
                    containerHeight={240}
                  />
                </div>
                <Button
                  onClick={startDraw}
                  size="lg"
                  className="mb-7 w-full rounded-lg bg-purple-600 text-base text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  开始抽牌
                </Button>
                <Button
                  onClick={reSelectSpread}
                  variant="outline"
                  size="lg"
                  className="w-full rounded-lg text-base text-white"
                >
                  自选其他牌阵
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* 牌阵选择标签页 */}
        {!(showRecommendation && recommendation) && (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 gap-2 bg-black/20 p-1 md:grid-cols-4">
                {spreadsData.map((spread) => (
                  <TabsTrigger
                    key={spread.route}
                    value={spread.route}
                    className="flex items-center gap-2 text-gray-300 transition-colors hover:text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    {categoryIcons[spread.route as keyof typeof categoryIcons]}
                    <span className="hidden sm:inline">{spread.type}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {spreadsData.map((spread) => (
                <TabsContent key={spread.route} value={spread.route} className="mt-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="mb-3 text-3xl font-bold text-white">{spread.type}</h2>
                      <p className="mx-auto max-w-4xl text-lg leading-relaxed text-gray-300">{spread.desc}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {spread.spreads.map((spreadItem) => (
                        <Card
                          key={spreadItem.name}
                          className="group relative cursor-pointer border-purple-400/20 bg-black/40 text-white backdrop-blur-md transition-all hover:border-purple-400/50 hover:bg-black/60"
                        >
                          {/* 问号图标 */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSpreadInfo(spreadItem)
                            }}
                            className="absolute top-2 right-2 z-10 h-8 w-8 p-0 text-gray-400 hover:bg-white/10 hover:text-white"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </Button>

                          <CardHeader className="pb-3">
                            <CardTitle className="pr-8 text-lg text-purple-400 group-hover:text-purple-300">
                              {spreadItem.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="relative overflow-hidden rounded-lg">
                              <SpreadPreview
                                link={spreadItem.link}
                                name={spreadItem.name}
                                containerWidth={280}
                                containerHeight={160}
                              />
                            </div>
                            <p className="line-clamp-3 text-sm leading-relaxed text-gray-300">{spreadItem.desc}</p>
                            {recommendation && (
                              <Button
                                size="sm"
                                className="w-full bg-purple-600/80 text-white hover:bg-purple-600"
                                onClick={() => handleSpreadSelect(spreadItem)}
                              >
                                选择此牌阵
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </div>
      <SpreadInfo content={selectedSpread} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>登录</DialogTitle>
            <DialogDescription>请登录以继续使用占卜功能。</DialogDescription>
          </DialogHeader>
          <LoginForm />
        </DialogContent>
      </Dialog>
    </div>
  )
}
