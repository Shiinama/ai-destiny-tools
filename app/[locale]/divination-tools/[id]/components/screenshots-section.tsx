import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'

interface ScreenshotsSectionProps {
  tool: {
    screenshotUrls: string[] | null
    name: string
  }
}

export default function ScreenshotsSection({ tool }: ScreenshotsSectionProps) {
  if (!tool.screenshotUrls || tool.screenshotUrls.length === 0) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="mb-4 text-xl font-bold">Screenshots</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tool.screenshotUrls.map((url, index) => (
            <div key={index} className="relative h-48 w-full overflow-hidden rounded-md">
              <Image src={url} alt={`${tool.name} screenshot ${index + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
