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
    <Card className="prose prose-violet prose-invert">
      <CardContent>
        <BlogBody content={content} />
      </CardContent>
    </Card>
  )
}
