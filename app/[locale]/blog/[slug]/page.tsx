import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { getArticleBySlug } from '@/actions/ai-content'
import BlogBody from '@/components/blog/blog-body'
import { formatDate } from '@/lib/utils'

interface PostSlugPageProps {
  params: Promise<{
    slug: string
  }>
}

export const dynamicParams = true
export const revalidate = false

export async function generateMetadata({ params }: PostSlugPageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  const t = await getTranslations('blog')

  if (!article) {
    return {
      title: t('postNotFound'),
      description: t('postNotFoundDescription')
    }
  }

  return {
    title: article.title,
    description: article.excerpt
  }
}

const PostSlugPage = async ({ params }: PostSlugPageProps) => {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  const t = await getTranslations('blog')

  if (!article || !article.publishedAt) {
    notFound()
  }

  return (
    <article className="prose prose-violet prose-invert prose-code:before:hidden prose-code:after:hidden max-w-none">
      {article.coverImageUrl && (
        <div className="relative mb-8 w-full" style={{ paddingBottom: '56.25%' }}>
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            layout="fill"
            objectFit="cover"
            className="absolute top-0 left-0 h-full w-full"
          />
        </div>
      )}
      <div className="mb-8 text-sm">{t('publishedAt', { date: formatDate(article.publishedAt) })}</div>
      <BlogBody content={article.content} />
    </article>
  )
}

export default PostSlugPage
