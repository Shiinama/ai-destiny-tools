'use client'

import { useTranslations } from 'next-intl'
import { useState, FormEvent } from 'react'
import { toast } from 'sonner'

import { createTool } from '@/actions/divination-tools'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'

interface Category {
  id: string
  key: string
}

interface SubmitSiteFormProps {
  categories: Category[]
}

export default function SubmitSiteForm({ categories }: SubmitSiteFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const t = useTranslations('submitTools')
  const divinationCategories = useTranslations('divinationCategories')

  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    url: '',
    contactInfo: '',
    categoryId: '',
    locale: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }))

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate name
    if (!formValues.name.trim()) {
      newErrors.name = t('validation.nameRequired')
    }

    // Validate description
    if (!formValues.description.trim()) {
      newErrors.description = t('validation.descriptionRequired')
    }

    // Validate URL
    const urlPattern = /^https?:\/\/.+/i
    if (!urlPattern.test(formValues.url)) {
      newErrors.url = t('validation.urlValid')
    }

    // Validate category
    if (!formValues.categoryId) {
      newErrors.categoryId = t('validation.categoryRequired')
    }

    // Validate contact info
    if (!formValues.contactInfo.trim()) {
      newErrors.contactInfo = t('validation.contactInfoRequired')
    }

    // Validate locale
    if (!formValues.locale) {
      newErrors.locale = t('validation.localeRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createTool({
        name: formValues.name,
        description: formValues.description,
        url: formValues.url,
        imageUrl: '',
        categoryId: formValues.categoryId,
        contactInfo: formValues.contactInfo,
        status: 'pending',
        locale: formValues.locale
      })

      if (result) {
        toast(t('toast.success.description'))
        router.push(`/`)
      } else {
        toast(t('toast.error.description'))
      }
    } catch {
      toast(t('toast.error.unexpected'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('form.name.label')}</p>
          <Input
            id="name"
            placeholder={t('form.name.placeholder')}
            value={formValues.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
          <p className="text-muted-foreground text-[0.8rem]">{t('form.name.description')}</p>
          {errors.name && <p className="text-destructive text-[0.8rem] font-medium">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('form.description.label')}</p>
          <Textarea
            id="description"
            placeholder={t('form.description.placeholder')}
            className="min-h-[100px]"
            value={formValues.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
          <p className="text-muted-foreground text-[0.8rem]">{t('form.description.description')}</p>
          {errors.description && <p className="text-destructive text-[0.8rem] font-medium">{errors.description}</p>}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('form.url.label')}</p>
          <Input
            id="url"
            placeholder={t('form.url.placeholder')}
            value={formValues.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
          />
          <p className="text-muted-foreground text-[0.8rem]">{t('form.url.description')}</p>
          {errors.url && <p className="text-destructive text-[0.8rem] font-medium">{errors.url}</p>}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('form.contactInfo.label')}</p>
          <Input
            id="contactInfo"
            placeholder={t('form.contactInfo.placeholder')}
            value={formValues.contactInfo}
            onChange={(e) => handleInputChange('contactInfo', e.target.value)}
          />
          <p className="text-muted-foreground text-[0.8rem]">{t('form.contactInfo.description')}</p>
          {errors.contactInfo && <p className="text-destructive text-[0.8rem] font-medium">{errors.contactInfo}</p>}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('form.category.label')}</p>
          <Select value={formValues.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
            <SelectTrigger id="category">
              <SelectValue placeholder={t('form.category.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {divinationCategories(`${category.key}.name` as any)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-[0.8rem]">{t('form.category.description')}</p>
          {errors.categoryId && <p className="text-destructive text-[0.8rem] font-medium">{errors.categoryId}</p>}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('form.locale.label')}</p>
          <Select value={formValues.locale} onValueChange={(value) => handleInputChange('locale', value)}>
            <SelectTrigger id="locale">
              <SelectValue placeholder={t('form.locale.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {locales.map((locale) => (
                <SelectItem key={locale.code} value={locale.code}>
                  {locale.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-[0.8rem]">{t('form.locale.description')}</p>
          {errors.locale && <p className="text-destructive text-[0.8rem] font-medium">{errors.locale}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('form.submit.loading') : t('form.submit.label')}
        </Button>
      </form>
    </div>
  )
}
