import { Info, Calendar } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface QuestionSpreadDialogProps {
  isOpen: boolean
  onClose: () => void
  question?: string
  spreadName?: string
  spreadDesc?: string
  reason?: string
  spreadCategory?: string
}

const QuestionSpreadDialog = ({
  isOpen,
  onClose,
  question,
  spreadName,
  spreadDesc,
  reason,
  spreadCategory
}: QuestionSpreadDialogProps) => {
  const currentDate = new Date()
    .toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .replace(/\//g, ' / ')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden border-purple-400/30 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white backdrop-blur-xl">
        {/* 顶部标题栏 */}
        <DialogHeader className="relative border-b border-purple-400/20 pb-6">
          <DialogTitle className="flex items-center gap-3 text-3xl font-bold">
            <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2">
              <Info className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">占卜信息</span>
          </DialogTitle>
          <div className="flex items-center gap-1 text-xs text-purple-400">
            <Calendar className="h-3 w-3" />
            <span>{currentDate}</span>
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-6">
            {/* 牌阵信息 */}
            {spreadName && (
              <div className="rounded-xl border border-purple-400/20 bg-gradient-to-r from-black/40 to-purple-900/20 p-6 backdrop-blur-sm">
                <h3 className="mb-3 text-lg font-semibold text-purple-300">牌阵名称：</h3>
                <div className="mb-4 text-center">
                  <h2 className="text-2xl font-bold text-purple-200">{spreadName}</h2>
                  {spreadCategory && (
                    <div className="mt-2 inline-block rounded-full bg-purple-600/30 px-3 py-1 text-sm text-purple-300">
                      {spreadCategory}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 问题部分 */}
            {question && (
              <div className="rounded-xl border border-purple-400/20 bg-gradient-to-r from-black/40 to-purple-900/20 p-6 backdrop-blur-sm">
                <h3 className="mb-3 text-lg font-semibold text-purple-300">您的问题：</h3>
                <p className="rounded-lg bg-purple-900/20 p-4 text-base leading-relaxed text-gray-200">{question}</p>
              </div>
            )}

            {/* 牌阵说明 */}
            {spreadDesc && (
              <div className="rounded-xl border border-purple-400/20 bg-gradient-to-r from-black/40 to-purple-900/20 p-6 backdrop-blur-sm">
                <h3 className="mb-3 text-lg font-semibold text-purple-300">牌阵说明：</h3>
                <p className="text-base leading-relaxed text-gray-300">{spreadDesc}</p>
              </div>
            )}

            {/* 推荐理由 */}
            {reason && (
              <div className="rounded-xl border border-purple-400/20 bg-gradient-to-r from-black/40 to-purple-900/20 p-6 backdrop-blur-sm">
                <h3 className="mb-3 text-lg font-semibold text-purple-300">推荐理由：</h3>
                <p className="text-base leading-relaxed text-gray-300">{reason}</p>
              </div>
            )}

            {/* 如果没有任何信息 */}
            {!question && !spreadName && !spreadDesc && !reason && (
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <Info className="mx-auto h-12 w-12 text-purple-400 opacity-50" />
                  <p className="mt-4 text-gray-400">暂无占卜信息</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QuestionSpreadDialog
