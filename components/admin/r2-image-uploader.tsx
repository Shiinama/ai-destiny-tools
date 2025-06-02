'use client'

import { Loader2, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, useRef } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function R2ImageUploader() {
  const t = useTranslations('admin.r2')
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<{ url: string; filename: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error(t('invalidFileType'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      toast.error(t('noFileSelected'))
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/r2', {
        method: 'POST',
        body: formData
      })

      const result: {
        error?: string
        url: string
        filename: string
      } = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('uploadFailed'))
      }

      if (!response.ok) {
        throw new Error(result.error || t('uploadFailed'))
      }

      toast.success(t('uploadSuccessful'))

      setUploadedImage({
        url: result.url,
        filename: result.filename
      })

      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(t('uploadFailed'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleCopyUrl = () => {
    if (!uploadedImage) return
    navigator.clipboard.writeText(uploadedImage.url)
    toast.success(t('urlCopied'))
  }

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="flex flex-col gap-2">
        <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} />

        <Button onClick={handleUpload} disabled={isUploading || !preview}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('uploading')}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {t('uploadImage')}
            </>
          )}
        </Button>
      </div>

      {preview && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">{t('preview')}</p>
          <div className="overflow-hidden rounded-md border">
            <img src={preview} alt={t('preview')} className="h-auto max-h-[300px] w-auto object-contain" />
          </div>
        </div>
      )}

      {uploadedImage && (
        <div className="mt-4 rounded-md border p-4">
          <h3 className="mb-2 text-lg font-medium">{t('uploadedImage')}</h3>
          <div className="mb-4 overflow-hidden rounded-md border">
            <img
              src={uploadedImage.url}
              alt={uploadedImage.filename}
              className="h-auto max-h-[300px] w-auto object-contain"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm break-all">
              <strong>{t('filename')}</strong> {uploadedImage.filename}
            </p>
            <p className="text-sm break-all">
              <strong>{t('url')}</strong>
              {uploadedImage.url}
            </p>
            <Button onClick={handleCopyUrl} size="sm">
              {t('copyImageUrl')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
