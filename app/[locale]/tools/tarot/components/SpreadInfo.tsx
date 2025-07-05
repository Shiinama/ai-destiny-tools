'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spread } from '@/types/tarot'

import SpreadPreview from '../components/SpreadPreview'

interface SpreadInfoProps {
  content: Spread | null
  isOpen: boolean
  onClose: () => void
}

export default function SpreadInfo({ content, isOpen, onClose }: SpreadInfoProps) {
  if (!content) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-[90vw] overflow-y-auto border-purple-400/30 bg-black/95 text-white sm:max-w-2xl lg:max-w-4xl">
        <DialogHeader className="relative">
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-0 right-0 h-8 w-8 p-0 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button> */}
          <DialogTitle className="text-2xl font-bold text-purple-400">牌阵释义</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-hidden">
          {/* 牌阵标题和描述 */}
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold text-white">{content.name}</h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-300">{content.desc}</p>
          </div>

          {/* 牌阵图片 */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <SpreadPreview
                link={content.link}
                name={content.name}
                containerWidth="100%"
                containerHeight={300}
                showCardNumbers={true}
              />
            </div>
          </div>

          {/* 牌位解释 */}
          {content.interpretations && content.interpretations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-center text-xl font-bold text-purple-400">牌位含义</h3>
              <div className="relative w-full overflow-x-auto overflow-y-hidden border-b p-6">
                {content.interpretations.length > 1 && (
                  <div className="flex min-w-max pb-4">
                    {content.interpretations.map((scenarioItems, scenarioIndex) => (
                      <div key={scenarioIndex} className="rounded-lg border border-purple-400/30 bg-purple-900/10 p-4">
                        <h4 className="border-b border-purple-400/20 pb-2 text-center text-lg font-semibold text-purple-300">
                          含义 {scenarioIndex + 1}
                        </h4>
                        <div className="space-y-2">
                          {scenarioItems.map((interp: any, itemIndex: number) => (
                            <div
                              key={`${scenarioIndex}-${itemIndex}`}
                              className="rounded-sm border border-purple-400/20 bg-purple-900/20 p-3"
                            >
                              {interp.position}：{interp.interpretation}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {content.interpretations.length === 1 && (
                  <div className="flex flex-wrap">
                    {content.interpretations[0].map((interp: any, itemIndex: number) => (
                      <div key={itemIndex} className="rounded-lg border border-purple-400/30 bg-purple-900/10 p-4">
                        {interp.position}：{interp.interpretation}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 关闭按钮 */}
          <div className="flex justify-center pt-4">
            <Button onClick={onClose} size="lg" className="bg-purple-600 px-8 text-white hover:bg-purple-700">
              我知道了
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
