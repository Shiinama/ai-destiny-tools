'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export function CategoryLinks({ categories }: { categories: { id: string; key: string }[] }) {
  const divinationCategories = useTranslations('divinationCategories')

  return (
    <section className="mb-8 flex gap-2">
      {categories?.map((category) => (
        <Button key={category.key} variant="outline" asChild>
          <Link href={`/${category.key}`}>{divinationCategories(`${category.key}.name` as any)}</Link>
        </Button>
      ))}
    </section>
  )
}
