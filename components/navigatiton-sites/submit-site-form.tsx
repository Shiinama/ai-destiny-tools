'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createSite } from '@/actions/ai-navigation/sites'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
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

  const formSchema = z.object({
    name: z.string().min(1, { message: t('validation.nameRequired') }),
    description: z.string().min(1, { message: t('validation.descriptionRequired') }),
    url: z.string().url({ message: t('validation.urlValid') }),
    imageUrl: z.string().url({ message: t('validation.urlValid') }),
    categoryId: z.string().min(1, { message: t('validation.categoryRequired') })
  })

  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-expect-error: not all properties of `formSchema` are defined in the `form` object
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      url: '',
      imageUrl: '',
      categoryId: ''
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('description', values.description)
    formData.append('url', values.url)
    formData.append('imageUrl', values.imageUrl || '')
    formData.append('categoryId', values.categoryId)

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.name.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.name.placeholder')} {...field} />
              </FormControl>
              <FormDescription>{t('form.name.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.description.label')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('form.description.placeholder')} className="min-h-[100px]" {...field} />
              </FormControl>
              <FormDescription>{t('form.description.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.url.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.url.placeholder')} {...field} />
              </FormControl>
              <FormDescription>{t('form.url.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.imageUrl.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.imageUrl.placeholder')} {...field} />
              </FormControl>
              <FormDescription>{t('form.imageUrl.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.category.label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.category.placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{t('form.category.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('form.submit.loading') : t('form.submit.label')}
        </Button>
      </form>
    </Form>
  )
}
