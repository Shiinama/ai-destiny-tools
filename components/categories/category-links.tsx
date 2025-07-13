'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { getCategoryDisplayName } from '@/lib/utils'

export function CategoryLinks({ categories }: { categories: { id: string; key: string }[] }) {
  const divinationCategories = useTranslations('divinationCategories')

  return (
    <section className="flex flex-wrap gap-2">
      {categories?.map((category) => {
        const displayName = divinationCategories(`${category.key}.name` as any)
        const nameToShow = getCategoryDisplayName(displayName)
        return (
          <Button key={category.key} variant="outline" asChild>
            <Link href={`/${category.key}`}>{nameToShow}</Link>
          </Button>
        )
      })}
    </section>
  )
}
