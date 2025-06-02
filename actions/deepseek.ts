'use server'

interface DeepSeekMessage {
  role: string
  content: string
}

interface DeepSeekChoice {
  message: DeepSeekMessage
  index?: number
  finish_reason?: string
}

interface DeepSeekUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

interface DeepSeekResponse {
  id: string
  object: string
  created: number
  model: string
  choices: DeepSeekChoice[]
  usage: DeepSeekUsage
}

export async function generateDeepSeekResponse(prompt: string): Promise<DeepSeekResponse> {
  if (!prompt.trim()) {
    throw new Error('Prompt is required')
  }

  try {
    const response = await fetch('https://api.gmi-serving.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GMI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-Prover-V2-671B',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 12000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`DeepSeek API error: ${JSON.stringify(error)}`)
    }

    const data: DeepSeekResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error calling DeepSeek API:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to process request')
  }
}
