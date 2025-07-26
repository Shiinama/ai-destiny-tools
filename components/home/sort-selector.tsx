'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from '@/i18n/navigation'

export type SortOption = 'default' | 'newest' | 'free-first' | 'paid-first'

interface SortSelectorProps {
  currentSort?: SortOption
}

export default function SortSelector({ currentSort = 'default' }: SortSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('HomePage')

  const handleSortChange = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'default') {
      params.delete('sort')
    } else {
      params.set('sort', value)
    }

    // 重置到第一页
    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  const sortOptions = [
    { value: 'default', label: t('sort.default') },
    { value: 'newest', label: t('sort.newest') },
    { value: 'free-first', label: t('sort.freeFirst') },
    { value: 'paid-first', label: t('sort.paidFirst') }
  ] as const

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">{t('sortBy')}:</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
