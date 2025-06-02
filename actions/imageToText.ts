'use server'

import { createAI } from '@/lib/ai'

export const imageToText = async ({ buffer, prompt }: { buffer: Uint8Array<ArrayBuffer>; prompt?: string }) => {
  // Get Cloudflare AI instance
  const cloudflareAI = createAI()

  // Run the AI model with the image and prompt
  const result = await cloudflareAI.run('@cf/llava-hf/llava-1.5-7b-hf', {
    image: Array.from(buffer),
    prompt: prompt ?? 'Describe this image in detail',
    max_tokens: 512
  })
  return result
}

export const scorePortrait = async ({ buffer }: { buffer: Uint8Array<ArrayBuffer> }) => {
  // First, get the image description
  const imageDescription = await imageToText({
    buffer,
    prompt:
      'Analyze this portrait in detail. Describe facial features, expression, lighting, composition, and overall quality.'
  })

  // Now use a text-based model to analyze the description and generate a score
  const cloudflareAI = createAI()

  const prompt = `
  Based on the following portrait description, provide a detailed analysis and scoring in JSON format.
  
  Description: ${imageDescription}
  
  Analyze the portrait and return a JSON object with the following structure:
  {
    "overall_score": (number between 1-10),
    "facial_features": {
      "eyes": (score 1-10),
      "nose": (score 1-10),
      "mouth": (score 1-10),
      "facial_structure": (score 1-10)
    },
    "technical_aspects": {
      "lighting": (score 1-10),
      "composition": (score 1-10),
      "clarity": (score 1-10),
      "color_balance": (score 1-10)
    },
    "expression": (score 1-10),
    "strengths": ["strength1", "strength2", ...],
    "areas_for_improvement": ["area1", "area2", ...],
    "summary": "brief summary of the portrait"
  }
  
  Provide only the JSON object without any additional text.
  `

  // Use a text model to generate the structured analysis
  const analysisResult = await cloudflareAI.run('@cf/meta/llama-3-8b-instruct', {
    prompt,
    stream: false,
    max_tokens: 1024
  })

  if ('response' in analysisResult) {
    try {
      // The model might return text before or after the JSON, so we need to extract just the JSON part
      const jsonMatch = analysisResult.response?.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in the response')
      }

      const jsonString = jsonMatch[0]
      const scoreData = JSON.parse(jsonString)
      return scoreData
    } catch (error) {
      console.error('Failed to parse portrait scoring result:', error)
      return {
        error: 'Failed to generate portrait score',
        raw_response: analysisResult
      }
    }
  }
}
