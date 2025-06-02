'use client'

import { useTranslations } from 'next-intl'
import { use, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { getArticleBySlug, updateArticle, deleteArticle } from '@/actions/ai-content'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from '@/i18n/navigation'

export default function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const t = useTranslations('admin.edit')
  const { slug } = use(params)

  const [article, setArticle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await getArticleBySlug(slug)
        if (data) {
          setArticle(data)
          setIsPublished(!!data.publishedAt)
        } else {
          toast.error(t('errors.articleNotFound'))
          router.push('/admin/articles')
        }
      } catch (error) {
        console.error('Error fetching article:', error)
        toast.error(t('errors.fetchFailed'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [slug, router, t])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setArticle({
      ...article,
      [field]: e.target.value
    })
  }

  const handlePublishToggle = () => {
    setIsPublished(!isPublished)
  }

  const handleSave = async () => {
    if (!article) return

    setIsSaving(true)
    try {
      const updatedData = {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        publishedAt: isPublished ? new Date() : null
      }

      await updateArticle(slug, updatedData)
      toast.success(t('success.updated'))
      router.push('/admin/articles')
    } catch (error) {
      console.error('Error updating article:', error)
      toast.error(t('errors.updateFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteArticle(slug)
      toast.success(t('success.deleted'))
      router.push('/admin/articles')
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error(t('errors.deleteFailed'))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>{t('loading')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? t('buttons.deleting') : t('buttons.deleteArticle')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>{t('deleteDialog.description')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>{t('buttons.delete')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6 shadow">
        <div className="mb-4">
          <Label htmlFor="title">{t('articleForm.titleLabel')}</Label>
          <Input id="title" value={article.title} onChange={(e) => handleInputChange(e, 'title')} />
        </div>

        <div className="mb-4">
          <Label htmlFor="excerpt">{t('articleForm.excerptLabel')}</Label>
          <Textarea id="excerpt" value={article.excerpt} onChange={(e) => handleInputChange(e, 'excerpt')} rows={3} />
        </div>

        <div className="mb-6">
          <Label htmlFor="content">{t('articleForm.contentLabel')}</Label>
          <Textarea
            id="content"
            value={article.content}
            onChange={(e) => handleInputChange(e, 'content')}
            rows={20}
            className="font-mono"
          />
        </div>

        <div className="mb-6 flex items-center space-x-2">
          <Switch id="published" checked={isPublished} onCheckedChange={handlePublishToggle} />
          <Label htmlFor="published">{t('articleForm.publishArticle')}</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/articles')}>
            {t('buttons.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('buttons.saving') : t('buttons.saveArticle')}
          </Button>
        </div>
      </div>
    </>
  )
}
