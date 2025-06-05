'use client'

import { useTranslations } from 'next-intl'
import { useState, FormEvent } from 'react'
import { toast } from 'sonner'

import { createSite } from '@/actions/ai-navigation/sites'
import { SiteImageUploader } from '@/components/navigatiton-sites/site-image-uploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from '@/i18n/navigation'

interface Category {
  id: string
  name: string
}

interface SubmitSiteFormProps {
  categories: Category[]
}

export default function SubmitSiteForm({ categories }: SubmitSiteFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const t = useTranslations('submitTools')

  // Form state
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    url: '',
    imageUrl: '',
    categoryId: ''
  })

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }))

    // Clear error when field is edited
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
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    if (!urlPattern.test(formValues.url)) {
      newErrors.url = t('validation.urlValid')
    }

    // Validate image URL
    if (formValues.imageUrl && !urlPattern.test(formValues.imageUrl)) {
      newErrors.imageUrl = t('validation.urlValid')
    }

    // Validate category
    if (!formValues.categoryId) {
      newErrors.categoryId = t('validation.categoryRequired')
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

    const formData = new FormData()
    formData.append('name', formValues.name)
    formData.append('description', formValues.description)
    formData.append('url', formValues.url)
    formData.append('imageUrl', formValues.imageUrl || '')
    formData.append('categoryId', formValues.categoryId)

    try {
      const result = await createSite(formData)

      if (result.success) {
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
          <p className="text-sm font-medium">{t('form.imageUrl.label')}</p>
          <SiteImageUploader
            onUploadComplete={(imageUrl) => handleInputChange('imageUrl', imageUrl)}
            currentImageUrl={formValues.imageUrl}
          />
          <p className="text-muted-foreground text-[0.8rem]">{t('form.imageUrl.description')}</p>
          {errors.imageUrl && <p className="text-destructive text-[0.8rem] font-medium">{errors.imageUrl}</p>}
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
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-[0.8rem]">{t('form.category.description')}</p>
          {errors.categoryId && <p className="text-destructive text-[0.8rem] font-medium">{errors.categoryId}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('form.submit.loading') : t('form.submit.label')}
        </Button>
      </form>
    </div>
  )
}
