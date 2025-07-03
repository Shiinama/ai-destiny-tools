import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const InterpretationDialog = ({
  isOpen,
  onClose,
  text,
  isLoading
}: {
  isOpen: boolean
  onClose: () => void
  text: string
  isLoading: boolean
}) => {
  const t = useTranslations('tools.tarot')
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-slate-800 p-8 text-slate-200 shadow-2xl focus:outline-none">
        <DialogHeader className="relative">
          <DialogTitle className="mb-4 text-2xl font-bold text-amber-400">{'✨ ' + t('title')}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-4">
          {isLoading ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center">
              <Sparkles className="h-10 w-10 animate-spin text-amber-500" />
              <p className="mt-4 text-slate-400">{t('draw.turnAll')}</p>
            </div>
          ) : (
            <DialogDescription className="text-base leading-relaxed whitespace-pre-wrap text-slate-300">
              {text || t('draw.turnAll')}
            </DialogDescription>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InterpretationDialog
