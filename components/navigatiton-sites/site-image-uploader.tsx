'use client'

import { Upload, ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface SiteImageUploaderProps {
  onUploadComplete: (imageUrl: string) => void
  currentImageUrl?: string
  aspectRatio?: string // Format: "16:9", "1:1", "4:3", etc.
  maxSizeMB?: number
  className?: string
}

export function SiteImageUploader({
  onUploadComplete,
  currentImageUrl = '',
  aspectRatio = '16:9',
  maxSizeMB = 5,
  className
}: SiteImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('submitTools')

  // Calculate aspect ratio style
  const aspectRatioStyle = useCallback(() => {
    if (!aspectRatio) return {}

    const [width, height] = aspectRatio.split(':').map(Number)
    return {
      aspectRatio: `${width}/${height}`
    }
  }, [aspectRatio])

  useEffect(() => {
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl)
    }
  }, [currentImageUrl])

  // Handle clipboard paste events - only when dialog is open
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isDialogOpen || isUploading) return

      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            handleFileUpload(file)
            break
          }
        }
      }
    }

    // Only add the event listener when the dialog is open
    if (isDialogOpen) {
      window.addEventListener('paste', handlePaste)
    }

    return () => window.removeEventListener('paste', handlePaste)
  }, [isDialogOpen, isUploading])

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('imageUpload.invalidType'))
      return false
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(t('imageUpload.tooLarge', { size: String(maxSizeMB) }))
      return false
    }

    return true
  }

  const handleFileUpload = async (file: File) => {
    if (!validateFile(file)) return

    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)

      // Upload to API endpoint
      const response = await fetch('/api/r2', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data: { url: string } = await response.json()
      onUploadComplete(data.url)
      setPreviewUrl(null)

      toast.success(t('imageUpload.success'))

      // Close dialog after successful upload
      setIsDialogOpen(false)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    handleFileUpload(file)

    // Reset input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isUploading) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (isUploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onUploadComplete('')
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preview of current image */}
      {previewUrl && (
        <div className="relative w-full max-w-sm overflow-hidden rounded-md border" style={aspectRatioStyle()}>
          <Image src={previewUrl} alt="Site preview" fill className="object-cover" />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="w-full max-w-sm cursor-pointer">
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {previewUrl ? t('imageUpload.change') : t('imageUpload.select')}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('imageUpload.title')}</DialogTitle>
          </DialogHeader>

          <div
            ref={dropZoneRef}
            className={cn(
              'relative w-full overflow-hidden rounded-md border transition-all',
              isDragging && 'border-primary bg-muted/50 border-dashed',
              !previewUrl && 'border-dashed'
            )}
            style={aspectRatioStyle()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <div className="flex h-full w-full flex-col items-center justify-center p-6">
              <ImageIcon className="text-muted-foreground mb-2 h-10 w-10" />
              <p className="text-muted-foreground text-center text-sm">{t('imageUpload.preview')}</p>
              <p className="text-muted-foreground mt-2 text-center text-xs">{t('imageUpload.dragOrClick')}</p>
              <p className="text-muted-foreground mt-1 text-center text-xs">{t('imageUpload.pasteSupported')}</p>
            </div>

            {isDragging && (
              <div className="bg-background/80 absolute inset-0 flex items-center justify-center">
                <p className="text-center font-medium">{t('imageUpload.dropHere')}</p>
              </div>
            )}

            {isUploading && (
              <div className="bg-background/80 absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                  <p className="text-sm font-medium">{t('imageUpload.uploading')}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>
              {t('imageUpload.cancel')}
            </Button>
            <Button type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  {t('imageUpload.uploading')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {t('imageUpload.select')}
                </span>
              )}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            id="site-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
