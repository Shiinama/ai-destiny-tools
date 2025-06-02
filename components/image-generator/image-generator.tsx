/* eslint-disable react/jsx-no-literals */

'use client'

import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

import { cloudflareTextToImage } from '@/actions/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ImageGeneratorProps {
  className?: string
}

export function ImageGenerator({ className }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    try {
      setIsGenerating(true)
      setError(null)

      const result = await cloudflareTextToImage(prompt)

      if (result.success && result.imageData) {
        setGeneratedImage(result.imageData)
        if (result.imageUrl) {
          setImageUrl(result.imageUrl)
        }
      } else {
        setError(result.error || 'Failed to generate image')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <div className="flex flex-col space-y-2">
        <label htmlFor="prompt" className="text-sm font-medium">
          Image Prompt
        </label>
        <div className="flex space-x-2">
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a description of the image you want to generate..."
            disabled={isGenerating}
            className="flex-1"
          />
          <Button onClick={handleGenerateImage} disabled={isGenerating || !prompt.trim()}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating
              </>
            ) : (
              'Generate'
            )}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {generatedImage && (
        <div className="mt-4">
          <h3 className="mb-2 text-lg font-medium">Generated Image</h3>
          <div className="overflow-hidden rounded-md border">
            <figure className="mx-auto flex max-w-lg flex-col items-center">
              <img src={generatedImage} alt={prompt} className="h-auto w-full" />
              <figcaption className="p-2 text-sm text-gray-500">
                {prompt}
                {imageUrl && (
                  <div className="mt-1">
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View stored image
                    </a>
                  </div>
                )}
              </figcaption>
            </figure>
          </div>
        </div>
      )}
    </div>
  )
}
