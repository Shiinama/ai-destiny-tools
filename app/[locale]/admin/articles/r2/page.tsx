import { useTranslations } from 'next-intl'

import { R2ImageUploader } from '@/components/admin/r2-image-uploader'

export default function R2AdminPage() {
  const t = useTranslations('admin.r2')

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">{t('title')}</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">{t('uploadNew')}</h2>
        <R2ImageUploader />
      </div>
    </div>
  )
}
