'use client'

import { Upload, ImageIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

interface SiteImageUploaderProps {
  onUploadComplete: (imageUrl: string) => void
  currentImageUrl?: string
}

export function SiteImageUploader({ onUploadComplete, currentImageUrl = '' }: SiteImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('submitTools')

  useEffect(() => {
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl)
    }
  }, [currentImageUrl])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error(t('imageUpload.invalidType'))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('imageUpload.tooLarge'))
      return
    }

    setIsUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)

      // Upload to your API endpoint
      const response = await fetch('/api/r2', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data: {
        url: string
      } = await response.json()
      onUploadComplete(data.url)
      toast.success(t('imageUpload.success'))
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(t('imageUpload.error'))
      if (!currentImageUrl) {
        setPreviewUrl(null)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-md border">
          <img src={previewUrl} alt="Site preview" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex aspect-video w-full max-w-sm flex-col items-center justify-center rounded-md border border-dashed p-4">
          <ImageIcon className="text-muted-foreground mb-2 h-10 w-10" />
          <p className="text-muted-foreground text-sm">{t('imageUpload.preview')}</p>
        </div>
      )}

      <div className="flex w-full max-w-sm items-center">
        <Button
          type="button"
          variant="outline"
          className="w-full cursor-pointer"
          disabled={isUploading}
          onClick={handleButtonClick}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              {t('imageUpload.uploading')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {previewUrl ? t('imageUpload.change') : t('imageUpload.select')}
            </span>
          )}
        </Button>
        <input
          ref={fileInputRef}
          id="site-image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  )
}
