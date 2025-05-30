/* eslint-disable react/jsx-no-literals */
import { ImageGenerator } from '@/components/image-generator/image-generator'

export default function ImageGeneratorPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">AI Image Generator</h1>
      <p className="mb-6 text-gray-600">Enter a prompt to generate an image using Cloudflare's AI models.</p>

      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <ImageGenerator />
      </div>
    </div>
  )
}
