'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { saveBatchArticles } from '@/actions/ai-content'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'

export default function BatchArticlesPage() {
  const router = useRouter()
  const t = useTranslations('admin.batch')
  const common = useTranslations('common')
  const [keywordsInput, setKeywordsInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [publishImmediately, setPublishImmediately] = useState(true)
  const [generatedArticles, setGeneratedArticles] = useState<Array<any>>([])
  const [results, setResults] = useState<Array<any>>([])
  const [selectAll, setSelectAll] = useState(true)
  const [selectedLocale, setSelectedLocale] = useState('en') // Default to English

  const handleGenerate = async () => {
    if (!keywordsInput.trim()) {
      toast.error(t('errors.emptyKeywords'))
      return
    }

    // Split keywords by newline and filter out empty lines
    const keywords = keywordsInput
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0)

    if (keywords.length === 0) {
      toast.error(t('errors.noValidKeywords'))
      return
    }

    setIsGenerating(true)
    const batchSize = 8
    const results = []

    try {
      for (let i = 0; i < keywords.length; i += batchSize) {
        const batch = keywords.slice(i, i + batchSize)
        const batchPromises = batch.map(async (keyword) => {
          const response = await fetch('/api/generate-article', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ keyword, locale: selectedLocale })
          })

          if (!response.ok) {
            const errorData = await response.json()
            return {
              keyword,
              error: errorData,
              status: 'error'
            }
          }

          const article = await response.json()
          return {
            keyword,
            article,
            status: 'success'
          }
        })

        const batchResults = []
        for (const promise of batchPromises) {
          try {
            const result = await promise
            batchResults.push(result)
          } catch (error) {
            batchResults.push({
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        }
        results.push(...batchResults)
      }

      const articlesWithSelection = results.map((item) => ({
        ...item,
        selected: item.status === 'success'
      }))

      setGeneratedArticles(articlesWithSelection)

      const successCount = results.filter((a) => a.status === 'success').length
      const errorCount = results.filter((a) => a.status === 'error').length

      toast.success(
        t('success.generated', {
          successCount: String(successCount),
          errorMessage: errorCount > 0 ? t('success.withErrors', { errorCount: String(errorCount) }) : ''
        })
      )
    } catch (error) {
      console.error('Error generating articles:', error)
      toast.error(t('errors.generateFailed'))
    } finally {
      setIsGenerating(false)
    }
  }
  const handleSave = async () => {
    if (generatedArticles.length === 0) {
      toast.error(t('errors.noArticlesToSave'))
      return
    }

    const selectedArticles = generatedArticles
      .filter((item) => item.status === 'success' && item.selected)
      .map((item) => ({
        ...item.article,
        selected: true,
        locale: selectedLocale // Ensure locale is passed to save function
      }))

    if (selectedArticles.length === 0) {
      toast.error(t('errors.noSelectedArticles'))
      return
    }

    setIsSaving(true)
    try {
      const saveResults = await saveBatchArticles(selectedArticles, publishImmediately)
      setResults(saveResults)

      const successCount = saveResults.filter((r) => r.status === 'success').length
      const errorCount = saveResults.filter((r) => r.status === 'error').length

      toast.success(
        t('success.saved', {
          successCount: String(successCount),
          publishStatus: publishImmediately ? t('publishStatus.published') : t('publishStatus.draft'),
          errorMessage: errorCount > 0 ? t('success.withErrors', { errorCount: String(errorCount) }) : ''
        })
      )
    } catch (error) {
      console.error('Error saving articles:', error)
      toast.error(t('errors.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)

    setGeneratedArticles(
      generatedArticles.map((item) => ({
        ...item,
        selected: item.status === 'success' ? newSelectAll : false
      }))
    )
  }

  const toggleArticleSelection = (index: number) => {
    const updatedArticles = [...generatedArticles]
    updatedArticles[index] = {
      ...updatedArticles[index],
      selected: !updatedArticles[index].selected
    }
    setGeneratedArticles(updatedArticles)

    // Update selectAll state based on whether all successful articles are selected
    const allSuccessfulSelected = updatedArticles
      .filter((item) => item.status === 'success')
      .every((item) => item.selected)

    setSelectAll(allSuccessfulSelected)
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button variant="outline" onClick={() => router.push('/admin/articles')}>
          {t('backToArticles')}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('keywordsCard.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="keywords">{t('keywordsCard.label')}</Label>
            <Textarea
              id="keywords"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder={t('keywordsCard.placeholder')}
              rows={5}
              disabled={isGenerating}
              className="mt-4 font-mono"
            />
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

          <div className="mb-4 flex items-center space-x-2">
            <Switch id="published" checked={publishImmediately} onCheckedChange={setPublishImmediately} />
            <Label htmlFor="published">{t('publishImmediately')}</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isGenerating || !keywordsInput.trim()}>
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGenerating ? t('buttons.generating') : t('buttons.generateArticles')}
            </Button>

            {generatedArticles.length > 0 && (
              <Button
                onClick={handleSave}
                disabled={isSaving || !generatedArticles.some((a) => a.selected && a.status === 'success')}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? t('buttons.saving') : t('buttons.saveSelected')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {generatedArticles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('generatedArticles.title')}</span>
              {generatedArticles.some((a) => a.status === 'success') && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="selectAll" checked={selectAll} onCheckedChange={toggleSelectAll} />
                  <Label htmlFor="selectAll" className="text-sm font-normal">
                    {t('generatedArticles.selectAll')}
                  </Label>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generatedArticles.map((item, index) => (
                <div key={index} className="flex items-center rounded border p-2">
                  {item.status === 'success' && (
                    <div className="mr-2">
                      <Checkbox
                        id={`article-${index}`}
                        checked={item.selected}
                        onCheckedChange={() => toggleArticleSelection(index)}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <span className="font-medium">{item.status === 'success' ? item.article.title : item.keyword}</span>
                  </div>
                  <div>
                    {item.status === 'success' ? (
                      <span className="text-success font-medium">{t('status.generated')}</span>
                    ) : (
                      <span className="text-destructive font-medium">{t('status.failed')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('saveResults.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center rounded border p-2">
                  <div className="flex-1">
                    <span className="font-medium">{result.title}</span>
                  </div>
                  <div>
                    {result.status === 'success' ? (
                      <span className="text-success font-medium">{t('status.saved')}</span>
                    ) : (
                      <span className="text-destructive font-medium">{t('status.failed')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
