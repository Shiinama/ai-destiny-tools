'use client'

import { Loader2 } from 'lucide-react'
import { use, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { getArticleBySlug, updateArticle, deleteArticle, generateAndUploadCoverImage } from '@/actions/ai-content'
import { SiteImageUploader } from '@/components/navigatiton-sites/site-image-uploader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from '@/i18n/navigation'

const imageStyles = [
  {
    id: 'mystical',
    name: '神秘/占卜风格',
    description: '神秘而迷人的3D渲染图像，展现命运的交织与预言的力量，融入微妙的神秘符号和能量流动'
  },
  {
    id: 'cosmic',
    name: '自然/宇宙风格',
    description: '融合宇宙和自然元素的数字绘画，表现星象预测与命运轨迹，展示天体与人类命运的神秘联系'
  },
  {
    id: 'watercolor',
    name: '水彩命运风格',
    description: '通过流动的水彩技法表现命运的流转与变化，以柔和的色彩渐变和朦胧效果展示预言的模糊边界'
  },
  {
    id: 'minimalist',
    name: '极简预言风格',
    description: '使用简约线条和有限色彩表达深刻的命运概念，通过留白和象征性元素传达预言的力量'
  },
  {
    id: 'futuristic',
    name: '未来预测风格',
    description: '融合科技与预言的未来主义视觉，展现数字化占卜工具和全息预言，以现代方式呈现古老的命运智慧'
  },
  {
    id: 'fantasy',
    name: '奇幻命运风格',
    description: '具有魔法元素的奇幻插图，展现命运织者、预言水晶或命运之书等神秘物品，营造命运被揭示的奇幻场景'
  }
]

export default function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const { slug } = use(params)

  const [article, setArticle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('mystical')
  const [customTitle, setCustomTitle] = useState('')
  const [customKeyword, setCustomKeyword] = useState('')

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await getArticleBySlug(slug)
        if (data) {
          setArticle(data)
          setIsPublished(!!data.publishedAt)
        } else {
          toast.error('文章未找到')
          router.push('/admin/articles')
        }
      } catch (error) {
        console.error('获取文章失败:', error)
        toast.error('获取文章数据失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [slug, router])

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
        coverImageUrl: article.coverImageUrl,
        publishedAt: isPublished ? new Date() : null
      }

      await updateArticle(slug, updatedData)
      toast.success('文章更新成功')
      router.push('/admin/articles')
    } catch (error) {
      console.error('更新文章失败:', error)
      toast.error('更新文章失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteArticle(slug)
      toast.success('文章删除成功')
      router.push('/admin/articles')
    } catch (error) {
      console.error('删除文章失败:', error)
      toast.error('删除文章失败')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleImageUpload = (imageUrl: string) => {
    setArticle({
      ...article,
      coverImageUrl: imageUrl
    })
  }

  const handleGenerateAICoverImage = async () => {
    if (!customTitle && !article.title) {
      toast.error('请填写标题以生成相关图片')
      return
    }

    setIsGeneratingImage(true)

    try {
      // 使用自定义标题/关键词（如果提供），否则使用文章数据
      const title = customTitle || article.title
      const keyword = customKeyword || article.excerpt?.substring(0, 50)

      const imageUrl = await generateAndUploadCoverImage(title, keyword, selectedStyle)

      if (imageUrl) {
        setArticle({
          ...article,
          coverImageUrl: imageUrl
        })
        toast.success('AI封面图生成成功')
      } else {
        toast.error('生成图片失败')
      }
    } catch (error) {
      console.error('生成AI图片时发生错误:', error)
      toast.error('生成AI图片时发生错误')
    } finally {
      setIsGeneratingImage(false)
      setImageDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">编辑文章</h1>
        <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
          {isDeleting ? '删除中...' : '删除文章'}
        </Button>
      </div>

      <div className="bg-card rounded-lg border p-6 shadow">
        <div className="mb-4">
          <Label htmlFor="title">文章标题</Label>
          <Input id="title" value={article.title} onChange={(e) => handleInputChange(e, 'title')} />
        </div>

        <div className="mb-4">
          <Label htmlFor="excerpt">文章摘要</Label>
          <Textarea id="excerpt" value={article.excerpt} onChange={(e) => handleInputChange(e, 'excerpt')} rows={3} />
        </div>

        {/* 封面图片部分 */}
        <div className="mb-4">
          <Label htmlFor="coverImage">封面图片</Label>
          <div className="mt-2 flex flex-col gap-4">
            {article.coverImageUrl && (
              <div className="relative">
                <img src={article.coverImageUrl} alt="封面" className="h-48 w-full rounded-md object-cover" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <SiteImageUploader onUploadComplete={handleImageUpload} currentImageUrl={article.coverImageUrl} />

              <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    生成AI封面
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>生成AI封面图</DialogTitle>
                    <DialogDescription>自定义标题和关键词以生成更符合预期的图片</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="custom-title">自定义标题</Label>
                      <Input
                        id="custom-title"
                        placeholder={article.title}
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                      />
                      <p className="text-muted-foreground text-xs">用于生成图片的标题，留空则使用文章标题</p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="custom-keyword">自定义关键词</Label>
                      <Input
                        id="custom-keyword"
                        placeholder="输入关键词，用逗号分隔"
                        value={customKeyword}
                        onChange={(e) => setCustomKeyword(e.target.value)}
                      />
                      <p className="text-muted-foreground text-xs">用于增强图片相关性的关键词，留空则使用文章摘要</p>
                    </div>

                    <div className="grid gap-2">
                      <Label>选择图片风格</Label>
                      <RadioGroup value={selectedStyle} onValueChange={setSelectedStyle} className="gap-2">
                        {imageStyles.map((style) => (
                          <div key={style.id} className="flex items-center space-x-2 rounded-md border p-2">
                            <RadioGroupItem value={style.id} id={style.id} />
                            <div className="grid gap-1">
                              <Label htmlFor={style.id} className="font-medium">
                                {style.name}
                              </Label>
                              <p className="text-muted-foreground text-xs">{style.description}</p>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setImageDialogOpen(false)}>
                      取消
                    </Button>
                    <Button type="button" onClick={handleGenerateAICoverImage} disabled={isGeneratingImage}>
                      {isGeneratingImage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isGeneratingImage ? '生成中...' : '生成图片'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {article.coverImageUrl && (
                <Button type="button" variant="outline" onClick={() => setArticle({ ...article, coverImageUrl: '' })}>
                  清除图片
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Label htmlFor="content">文章内容</Label>
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
          <Label htmlFor="published">发布文章</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/articles')}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? '保存中...' : '保存文章'}
          </Button>
        </div>
      </div>
    </>
  )
}
