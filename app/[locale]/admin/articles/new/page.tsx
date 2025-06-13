'use client'

import { Loader2 } from 'lucide-react'
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
  const [keyword, setKeyword] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedArticle, setGeneratedArticle] = useState<{
    title: string
    slug: string
    coverImageUrl: string
    content: string
    excerpt: string
  }>()
  const [isSaving, setIsSaving] = useState(false)
  const [publishImmediately, setPublishImmediately] = useState(true)
  const [selectedLocale, setSelectedLocale] = useState('zh') // 默认为中文

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      toast.error('关键词不能为空')
      return
    }

    setIsGenerating(true)
    try {
      const article = await generateArticle({
        keyword: keyword.trim(),
        locale: selectedLocale
      })
      setGeneratedArticle(article)
      toast.success('文章生成成功')
    } catch (error) {
      console.error('生成文章时出错:', error)
      toast.error('生成文章失败')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedArticle) return

    setIsSaving(true)
    try {
      await saveGeneratedArticle(
        {
          ...generatedArticle,
          locale: selectedLocale
        },
        publishImmediately
      )
      toast.success(publishImmediately ? '文章已发布' : '文章已保存为草稿')
      router.push('/admin/articles')
    } catch (error) {
      console.error('保存文章时出错:', error)
      toast.error('保存文章失败')
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
        <h1 className="text-2xl font-bold">创建新文章</h1>
        <Button variant="outline" onClick={() => router.push('/admin/articles')}>
          返回文章列表
        </Button>
      </div>

      <div className="border-border bg-card mb-6 rounded-lg border p-6 shadow">
        <div className="mb-4">
          <Label htmlFor="keyword">输入关键词</Label>
          <div className="mt-4 flex gap-2">
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="输入关键词，AI将为您生成相关文章"
              disabled={isGenerating}
            />
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGenerating ? '正在生成...' : '生成文章'}
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="language" className="mb-2 block">
            语言
          </Label>
          <Select value={selectedLocale} onValueChange={setSelectedLocale}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="选择语言" />
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
            <Label htmlFor="title">文章标题</Label>
            <Input id="title" value={generatedArticle.title} onChange={(e) => handleInputChange(e, 'title')} />
          </div>

          <div className="mb-4">
            <Label htmlFor="slug">文章别名</Label>
            <Input id="slug" value={generatedArticle.slug} onChange={(e) => handleInputChange(e, 'slug')} />
          </div>

          <div className="mb-4">
            <Label htmlFor="coverImageUrl">封面图片URL</Label>
            <Input 
              id="coverImageUrl" 
              value={generatedArticle.coverImageUrl} 
              onChange={(e) => handleInputChange(e, 'coverImageUrl')} 
              placeholder="输入图片URL地址"
            />
            {generatedArticle.coverImageUrl && (
              <div className="mt-2">
                <img 
                  src={generatedArticle.coverImageUrl} 
                  alt="文章封面预览" 
                  className="h-40 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x400?text=图片加载失败";
                  }}
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            <Label htmlFor="excerpt">文章摘要</Label>
            <Textarea
              id="excerpt"
              value={generatedArticle.excerpt}
              onChange={(e) => handleInputChange(e, 'excerpt')}
              rows={3}
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="content">文章内容</Label>
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
            <Label htmlFor="published">立即发布</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push('/admin/articles')}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? '正在保存...' : '保存文章'}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}