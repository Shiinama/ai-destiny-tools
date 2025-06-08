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
        <h2 className="mb-4 text-xl font-bold">About</h2>
        <div className="prose dark:prose-invert max-w-none">
          {content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
