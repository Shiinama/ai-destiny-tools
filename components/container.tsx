import { cn } from '@/lib/utils'

export default function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mx-auto flex w-full max-w-(--breakpoint-xl) flex-1 flex-col px-2.5 py-8 md:px-20', className)}>
      {children}
    </div>
  )
}
