'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { generateArticle, saveGeneratedArticle } from '@/actions/ai-content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'

export default function NewArticlePage() {
  const router = useRouter()
  const t = useTranslations('admin.new')
  const common = useTranslations('common')
  const [keyword, setKeyword] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedArticle, setGeneratedArticle] = useState<{
    title: string
    slug: string
    content: string
    excerpt: string
  }>()
  const [isSaving, setIsSaving] = useState(false)
  const [publishImmediately, setPublishImmediately] = useState(true)
  const [selectedLocale, setSelectedLocale] = useState('en') // Default to English

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      toast.error(t('errors.emptyKeyword'))
      return
    }

    setIsGenerating(true)
    try {
      const article = await generateArticle({
        keyword: keyword.trim(),
        locale: selectedLocale // Pass the selected locale to the API
      })
      setGeneratedArticle(article)
      toast.success(t('success.generated'))
    } catch (error) {
      console.error('Error generating article:', error)
      toast.error(t('errors.generateFailed'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedArticle) return

    setIsSaving(true)
    try {
      // Pass the locale to the save function
      await saveGeneratedArticle(
        {
          ...generatedArticle,
          locale: selectedLocale
        },
        publishImmediately
      )
      toast.success(publishImmediately ? t('success.published') : t('success.savedAsDraft'))
      router.push('/admin/articles')
    } catch (error) {
      console.error('Error saving article:', error)
      toast.error(t('errors.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    if (!generatedArticle) return
    setGeneratedArticle({
      ...generatedArticle,
      [field]: e.target.value
    })
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button variant="outline" onClick={() => router.push('/admin/articles')}>
          {t('backToArticles')}
        </Button>
      </div>

      <div className="border-border bg-card mb-6 rounded-lg border p-6 shadow">
        <div className="mb-4">
          <Label htmlFor="keyword">{t('keywordSection.label')}</Label>
          <div className="mt-4 flex gap-2">
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('keywordSection.placeholder')}
              disabled={isGenerating}
            />
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGenerating ? t('buttons.generating') : t('buttons.generateArticle')}
            </Button>
          </div>
        </div>

        {/* Language selection dropdown */}
        <div className="mb-4">
          <Label htmlFor="language" className="mb-2 block">
            {common('language')}
          </Label>
          <Select value={selectedLocale} onValueChange={setSelectedLocale}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder={common('selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              {locales.map((locale) => (
                <SelectItem key={locale.code} value={locale.code}>
                  {locale.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {generatedArticle && (
        <div className="border-border bg-card rounded-lg border p-6 shadow">
          <div className="mb-4">
            <Label htmlFor="title">{t('articleForm.titleLabel')}</Label>
            <Input id="title" value={generatedArticle.title} onChange={(e) => handleInputChange(e, 'title')} />
          </div>

          <div className="mb-4">
            <Label htmlFor="slug">{t('articleForm.slugLabel')}</Label>
            <Input id="slug" value={generatedArticle.slug} onChange={(e) => handleInputChange(e, 'slug')} />
          </div>

          <div className="mb-4">
            <Label htmlFor="excerpt">{t('articleForm.excerptLabel')}</Label>
            <Textarea
              id="excerpt"
              value={generatedArticle.excerpt}
              onChange={(e) => handleInputChange(e, 'excerpt')}
              rows={3}
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="content">{t('articleForm.contentLabel')}</Label>
            <Textarea
              id="content"
              value={generatedArticle.content}
              onChange={(e) => handleInputChange(e, 'content')}
              rows={20}
              className="font-mono"
            />
          </div>

          <div className="mb-6 flex items-center space-x-2">
            <Switch id="published" checked={publishImmediately} onCheckedChange={setPublishImmediately} />
            <Label htmlFor="published">{t('articleForm.publishImmediately')}</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push('/admin/articles')}>
              {t('buttons.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? t('buttons.saving') : t('buttons.saveArticle')}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
