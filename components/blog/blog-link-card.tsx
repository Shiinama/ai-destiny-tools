import { Link } from '@/i18n/navigation'

interface BlogLinkCardProps {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImageUrl?: string
}

export default function BlogLinkCard({ id, slug, title, excerpt, coverImageUrl }: BlogLinkCardProps) {
  return (
    <Link key={id} href={`/blog/${slug}`} className="flex cursor-pointer items-center space-x-2">
      {coverImageUrl && (
        <div className="w-1/4">
          <img
            src={coverImageUrl}
            alt={title}
            className="h-full w-full rounded-lg object-cover"
            style={{ aspectRatio: '16/9' }}
          />
        </div>
      )}
      <div className="w-3/4">
        <h2 className="mb-1 text-xl font-semibold text-white">{title}</h2>
        <p className="text-gray-300">{excerpt}</p>
      </div>
    </Link>
  )
}
