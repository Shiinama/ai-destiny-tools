'use client'

import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { translateFieldsToLocales } from '@/actions/ai-content'
import { createTool, getCategories, upsertToolTranslations } from '@/actions/divination-tools'
import { SiteImageUploader } from '@/components/navigatiton-sites/site-image-uploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'
import { ToolStatus } from '@/lib/db/schema'

export default function NewToolPage() {
  const router = useRouter()
  const { locale } = useParams() as { locale: string }

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    categoryId: '',
    contactInfo: '',
    isFree: true,
    price: '',
    content: '',
    logoUrl: '',
    imageUrl: '',
    screenshotUrls: '',
    status: 'approved' as ToolStatus,
    platform: '',
    locale
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; key: string }>>([])

  useEffect(() => {
    getCategories().then((r) => {
      if (r) {
        setCategories(r)
      }
    })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isFree: checked }))
  }

  const handleImageUpload = (imageUrl: string, field: string) => {
    if (field === 'screenshotUrls') {
      setFormData((prev) => ({
        ...prev,
        screenshotUrls: prev.screenshotUrls ? `${prev.screenshotUrls},${imageUrl}` : imageUrl
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: imageUrl }))
    }
  }

  const togglePlatform = (platform: string) => {
    setFormData((prev) => {
      const platforms = prev.platform ? prev.platform.split(',') : []

      if (platforms.includes(platform)) {
        return {
          ...prev,
          platform: platforms.filter((p) => p !== platform).join(',')
        }
      } else {
        return {
          ...prev,
          platform: platforms.length > 0 ? `${prev.platform},${platform}` : platform
        }
      }
    })
  }

  const removeScreenshot = (index: number) => {
    setFormData((prev) => {
      const screenshots = prev.screenshotUrls ? prev.screenshotUrls.split(',') : []
      screenshots.splice(index, 1)
      return {
        ...prev,
        screenshotUrls: screenshots.join(',')
      }
    })
  }

  const validateForm = () => {
    if (!formData.name || !formData.description || !formData.url || !formData.categoryId) {
      toast.error('请填写所有必填字段')
      return false
    }
    return true
  }

  const submitForm = async (shouldRedirect = false) => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const result = await createTool(formData)

      if (result) {
        toast.success(`工具${shouldRedirect ? '创建' : '仅保存'}成功`)
        // 多语言自动翻译
        try {
          const targetLocaleCodes = locales.filter((l) => l.code !== 'en').map((l) => l.code)
          const translationsResult = await translateFieldsToLocales({
            fields: { content: formData.content, description: formData.description },
            targetLanguages: targetLocaleCodes
          })
          const translations = targetLocaleCodes.map((code) => ({
            locale: code,
            content: translationsResult[code]?.content || '',
            description: translationsResult[code]?.description || ''
          }))
          const upsertResult = await upsertToolTranslations(result.id, translations)
          if (upsertResult.code === 0) {
            toast.success('多语言翻译已全部同步完成')
          } else {
            toast.error(upsertResult.message)
          }
        } catch (err) {
          toast.error('多语言翻译同步失败')
        }
        if (shouldRedirect) {
          router.push('/admin/tools')
        } else {
          router.push(`/admin/tools/edit/${result.id}`)
        }
      } else {
        toast.error(`${shouldRedirect ? '创建' : '仅保存'}失败`)
      }
    } catch (error) {
      console.error('Error saving tool:', error)
      toast.error(`${shouldRedirect ? '创建' : '仅保存'}工具时发生错误`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitForm(true)
  }

  const handleSaveOnly = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitForm(false)
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">创建新工具</h1>
        <Button variant="outline" onClick={() => router.push('/admin/tools')}>
          返回列表
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-card space-y-6 rounded-lg border p-6 shadow">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="required">
              工具名称
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="输入工具名称"
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="required">
              工具描述
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="输入工具描述"
              rows={4}
              required
            />
          </div>
          <div>
            <Label htmlFor="content">详细内容</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="输入工具的详细内容描述"
              rows={8}
            />
          </div>
          <div>
            <Label htmlFor="url" className="required">
              工具链接
            </Label>
            <Input
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://example.com"
              type="url"
              required
            />
          </div>
          <div>
            <Label htmlFor="category" className="required">
              分类
            </Label>
            <Select value={formData.categoryId} onValueChange={(value) => handleSelectChange(value, 'categoryId')}>
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">状态</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange(value, 'status')}>
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'pending'}>待审核</SelectItem>
                <SelectItem value={'approved'}>已批准</SelectItem>
                <SelectItem value={'rejected'}>已拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="platform">平台</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {['web', 'ios', 'android', 'wechat', 'windows', 'mac', 'linux'].map((platform) => (
                <Button
                  key={platform}
                  type="button"
                  variant={formData.platform?.split(',').includes(platform) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => togglePlatform(platform)}
                  className="capitalize"
                >
                  {platform}
                </Button>
              ))}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">选择工具支持的平台</p>
          </div>
          <div>
            <Label htmlFor="logoUrl">Logo图片</Label>
            <SiteImageUploader
              aspectRatio="1:1"
              onUploadComplete={(imageUrl) => handleImageUpload(imageUrl, 'logoUrl')}
              currentImageUrl={formData.logoUrl}
            />
            <p className="text-muted-foreground mt-1 text-sm">推荐尺寸：1:1，正方形，支持透明背景</p>
          </div>
          <div>
            <Label htmlFor="imageUrl">封面图片</Label>
            <SiteImageUploader
              aspectRatio="16:9"
              onUploadComplete={(imageUrl) => handleImageUpload(imageUrl, 'imageUrl')}
              currentImageUrl={formData.imageUrl}
            />
            <p className="text-muted-foreground mt-1 text-sm">推荐尺寸：16:9，横向矩形</p>
          </div>
          <div>
            <Label htmlFor="screenshots">
              截图集 ({formData.screenshotUrls ? formData.screenshotUrls.split(',').filter(Boolean).length : 0})
            </Label>
            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
              {formData.screenshotUrls &&
                formData.screenshotUrls.split(',').map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`Screenshot ${index + 1}`} className="h-40 w-full rounded-md object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeScreenshot(index)}
                    >
                      删除
                    </Button>
                  </div>
                ))}
              {(!formData.screenshotUrls || formData.screenshotUrls.split(',').filter(Boolean).length < 6) && (
                <SiteImageUploader
                  aspectRatio="16:9"
                  onUploadComplete={(imageUrl) => handleImageUpload(imageUrl, 'screenshotUrls')}
                  currentImageUrl=""
                />
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">最多上传6张截图，推荐尺寸：16:9比例</p>
          </div>
          <div>
            <Label htmlFor="contactInfo">联系方式</Label>
            <Input
              id="contactInfo"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              placeholder="邮箱或其他联系方式"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="isFree" checked={formData.isFree} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="isFree">免费工具</Label>
          </div>
          {!formData.isFree && (
            <div>
              <Label htmlFor="price">价格</Label>
              <Input
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="例如：¥29.9/月"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/tools')}>
            取消
          </Button>
          <Button type="button" onClick={handleSaveOnly} disabled={isSubmitting} variant="secondary">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? '保存中...' : '仅保存'}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? '提交中...' : '创建工具'}
          </Button>
        </div>
      </form>
    </>
  )
}
