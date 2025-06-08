import BlogBody from '@/components/blog/blog-body'
import { Card, CardContent } from '@/components/ui/card'

interface AboutSectionProps {
  content: string | null
}

export default function AboutSection({ content }: AboutSectionProps) {
  if (!content) {
    return null
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="prose prose-violet prose-invert">
          <BlogBody content={content} />
        </div>
      </CardContent>
    </Card>
  )
}
