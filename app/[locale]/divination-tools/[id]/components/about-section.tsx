import BlogBody from '@/components/blog/blog-body'

interface AboutSectionProps {
  content: string | null
}

export default function AboutSection({ content }: AboutSectionProps) {
  if (!content) {
    return null
  }

  return (
    <div className="prose prose-violet prose-invert">
      <BlogBody content={content} />
    </div>
  )
}
