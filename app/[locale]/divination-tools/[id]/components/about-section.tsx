import BlogBody from '@/components/blog/blog-body'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AboutSectionProps {
  content: string | null
}

export default function AboutSection({ content }: AboutSectionProps) {
  if (!content) {
    return null
  }

  return (
    <Card className="prose prose-violet prose-invert max-w-none">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Introduction</CardTitle>
      </CardHeader>
      <CardContent>
        <BlogBody content={content} />
      </CardContent>
    </Card>
  )
}
