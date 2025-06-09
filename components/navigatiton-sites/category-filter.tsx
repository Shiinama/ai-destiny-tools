'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from '@/i18n/navigation'

interface Category {
  id: string
  key: string
}

interface CategoryFilterProps {
  categories: Category[]
  currentCategoryId?: string
  currentStatus?: string
}

export default function CategoryFilter({ categories, currentCategoryId, currentStatus }: CategoryFilterProps) {
  const router = useRouter()

  const buildFilterUrl = (categoryId?: string) => {
    const params = new URLSearchParams()

    if (currentStatus) {
      params.set('status', currentStatus)
    }

    if (categoryId) {
      params.set('categoryId', categoryId)
    }

    const queryString = params.toString()
    return `/admin/tools${queryString ? `?${queryString}` : ''}`
  }

  return (
    <Select
      defaultValue={currentCategoryId || ''}
      onValueChange={(value) => {
        router.push(buildFilterUrl(value || undefined))
      }}
    >
      <SelectTrigger className="h-8 w-50">
        <SelectValue placeholder="选择类别" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">全部类别</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.key}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
