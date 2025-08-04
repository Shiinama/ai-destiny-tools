'use server'

import { GoogleGenAI } from '@google/genai'
import { count, desc, eq, inArray } from 'drizzle-orm'

import { locales } from '@/i18n/routing'
import { createAI } from '@/lib/ai'
import { createDb } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { createR2 } from '@/lib/r2'

interface ArticleGenerationParams {
  keyword: string
  locale?: string
}

function getLanguageNameFromLocale(localeCode: string): string {
  const locale = locales.find((l) => l.code === localeCode)
  if (locale) {
    return locale.name
  }
  return 'English'
}

export async function generateArticle({ keyword, locale = 'en' }: ArticleGenerationParams) {
  const languageName = getLanguageNameFromLocale(locale)

  const systemPrompt = `
  You are a specialized divination and fortune-telling content writer for AI Destiny Tools. Your job is to create mystical, insightful content optimized for the keyword provided. Research the first 10 search results for this keyword on Google, analyze their structure and approach, then create unique content that aligns with divination practices while following SEO best practices.

  Content theme requirements:
  - Create content with a sense of immediacy and current relevance (generation date: ${new Date().toLocaleDateString()})
  - Focus exclusively on divination topics (tarot, astrology, numerology, I Ching, runes, etc.)
  - Balance mystical/spiritual elements with practical advice readers can apply to their lives
  - Maintain an authoritative yet approachable tone that respects divination traditions
  - Connect traditional divination wisdom with modern applications and challenges

  Format requirements:
  - Start with a single H1 title (# Title) that is EXACTLY 50 characters or less
  - The title must include the main keyword and evoke mystical curiosity
  - Use markdown formatting with proper heading structure (# for H1, ## for H2, etc.)
  - Include well-formatted paragraphs, lists, and other elements as appropriate
  
  SEO requirements:
  - Make the first paragraph suitable for a meta description
  - Answer common divination questions related to the topic in a conversational tone
  - Write in a natural, flowing style that mimics human writing patterns with varied sentence structures
  - Avoid obvious AI patterns like excessive lists and formulaic paragraph structures
  - Incorporate personal anecdotes or case studies of divination readings where appropriate
  - Include the most up-to-date information about divination practices and spiritual trends
  - Ensure comprehensive coverage with sufficient depth (minimum 2000 words)
  
  Language requirement:
  - Write the entire article in ${languageName} language
  - Ensure the content is culturally appropriate for ${languageName}-speaking audiences
  - Use proper grammar, idioms, and expressions specific to ${languageName}
  - Adapt divination concepts to cultural contexts relevant to ${languageName} speakers
  ${locale === 'ar' ? '- Follow right-to-left (RTL) text conventions' : ''}
  
  IMPORTANT: At the very end of your response, include two separate sections:
  1. "META_DESCRIPTION:" followed by a concise, SEO-friendly excerpt (130-140 characters max) that includes the main keyword naturally and evokes mystical curiosity.
  2. "URL_SLUG:" followed by an SEO-friendly URL slug for this article in ENGLISH ONLY (lowercase, words separated by hyphens, no special characters), regardless of the article language.
  
  Produce original, accurate, and valuable divination content of at least 10,000 tokens. Output the article content, starting with the H1 title, followed by the meta description and URL slug sections at the end.`

  const userPrompt = `Create an article about ${keyword} in ${languageName} language. Optimize it for search engines while maintaining high-quality, valuable content for readers.`

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })
    const model = 'gemini-2.5-flash-lite-preview-06-17'

    const chat = ai.chats.create({
      model: model,
      config: {
        maxOutputTokens: 65535,
        temperature: 0.7,
        topP: 0.9,
        systemInstruction: {
          parts: [
            {
              text: systemPrompt
            }
          ]
        }
      }
    })

    const response = await chat.sendMessage({
      message: [{ text: userPrompt }]
    })

    const fullResponse = response.text!

    const metaDescriptionMatch = fullResponse.match(/META_DESCRIPTION:\s*([\s\S]*?)(?=URL_SLUG:|$)/)
    const excerpt = metaDescriptionMatch ? metaDescriptionMatch[1].trim() : ''

    const urlSlugMatch = fullResponse.match(/URL_SLUG:\s*([\s\S]+)$/)
    let slug = urlSlugMatch ? urlSlugMatch[1].trim() : ''

    let content = fullResponse
    if (metaDescriptionMatch) {
      content = content.replace(/META_DESCRIPTION:[\s\S]*$/, '').trim()
    }

    const titleMatch = content.match(/^#\s+(.+)$/m)
    const extractedTitle = titleMatch ? titleMatch[1].trim() : 'Untitled Article'

    if (!slug) {
      slug = extractedTitle
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
    }

    let coverImageUrl = ''
    try {
      const generatedImageUrl = await generateArticleCoverImage(content, extractedTitle)
      coverImageUrl = generatedImageUrl || ''
    } catch (error) {
      console.warn('Failed to generate cover image:', error)
      // 即使封面图片生成失败，也不影响文章生成的成功状态
    }

    return {
      title: extractedTitle,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 140) + '...',
      locale,
      coverImageUrl
    }
  } catch (error) {
    throw error
  }
}

// 将生成的文章保存到数据库
export async function saveGeneratedArticle(
  article: {
    title: string
    coverImageUrl: string
    slug: string
    content: string
    excerpt: string
    locale?: string
  },
  publishImmediately = true
) {
  const database = createDb()

  // 准备文章数据
  const postData = {
    slug: article.slug,
    coverImageUrl: article.coverImageUrl,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    locale: article.locale || 'en', // Add locale to database
    publishedAt: publishImmediately ? new Date() : undefined,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  await database.insert(posts).values(postData)
}

export async function getPaginatedArticles({
  locale,
  page = 1,
  pageSize = 10
}: {
  locale?: string
  page?: number
  pageSize?: number
}) {
  const database = createDb()

  const currentPage = Math.max(1, page)
  const itemsPerPage = Math.max(1, pageSize)
  const offset = (currentPage - 1) * itemsPerPage

  const baseQuery = database.select().from(posts).orderBy(desc(posts.publishedAt))

  const query = locale ? baseQuery.where(eq(posts.locale, locale)) : baseQuery

  const countQuery = locale
    ? database.select({ count: count() }).from(posts).where(eq(posts.locale, locale))
    : database.select({ count: count() }).from(posts)

  const [articles, countResult] = await Promise.all([query.limit(itemsPerPage).offset(offset), countQuery])

  const totalItems = countResult[0]?.count || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    articles,
    pagination: {
      currentPage,
      pageSize: itemsPerPage,
      totalItems,
      totalPages
    }
  }
}

export async function getAllArticles(locale?: string) {
  const database = createDb()
  const query = database.select().from(posts).orderBy(desc(posts.publishedAt))

  if (locale) {
    return await query.where(eq(posts.locale, locale))
  }

  return await query
}

// 根据 slug 获取单篇文章
export async function getArticleBySlug(slug: string) {
  const database = createDb()
  const result = await database.select().from(posts).where(eq(posts.slug, slug))
  return result[0] || null
}

// 更新文章
export async function updateArticle(
  slug: string,
  data: {
    title?: string
    content?: string
    excerpt?: string
    publishedAt?: Date | null
    locale?: string
  }
) {
  const database = createDb()
  const updateData = {
    ...data,
    updatedAt: new Date()
  }

  await database.update(posts).set(updateData).where(eq(posts.slug, slug))

  // 返回更新后的文章
  return getArticleBySlug(slug)
}

// 删除文章
export async function deleteArticle(slug: string) {
  const database = createDb()
  await database.delete(posts).where(eq(posts.slug, slug))
  return { success: true }
}

export async function saveBatchArticles(
  articles: Array<{
    title: string
    slug: string
    coverImageUrl: string
    content: string
    excerpt: string
    locale?: string
    selected?: boolean
  }>,
  publishImmediately = true
) {
  const database = createDb()
  const results = []

  const articlesToSave = articles.filter((article) => article.selected !== false)

  const batchSize = 10
  for (let i = 0; i < articlesToSave.length; i += batchSize) {
    const batch = articlesToSave.slice(i, i + batchSize)

    const savePromises = batch.map(async (article) => {
      try {
        const postData = {
          slug: article.slug,
          title: article.title,
          coverImageUrl: article.coverImageUrl,
          excerpt: article.excerpt,
          content: article.content,
          locale: article.locale || 'en',
          publishedAt: publishImmediately ? new Date() : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        await database.insert(posts).values(postData)
        return {
          title: article.title,
          status: 'success'
        }
      } catch (error) {
        return {
          title: article.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    const batchResults = await Promise.all(savePromises)
    results.push(...batchResults)
  }

  return results
}

export async function generateAndUploadCoverImage(title: string, keyword: string, style?: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  const stylePrompts: Record<string, string> = {
    // Mystical/Divination theme (3D)
    mystical: `Create a mystical and enchanting 3D rendered image for an article titled "${title}". The image should visually represent the concept of "${keyword}" within a divination context. Include subtle mystical elements like ethereal light, sacred geometry, or metaphysical symbolism. Set the scene in a magical and ethereal environment that evokes spiritual insight.`,

    // Nature/Cosmic theme (Digital painting)
    cosmic: `Design a digital painting with cosmic and natural elements for "${title}". Incorporate the concept of "${keyword}" with celestial divination imagery like constellations, cosmic alignments, or planetary influences. Show the connection between natural elements and cosmic forces as channels of prophetic wisdom.`,

    // Watercolor style
    watercolor: `Create a delicate watercolor illustration for "${title}". Express the divinatory meaning of "${keyword}" through soft color washes, gentle gradients, and subtle textures. The image should have an ethereal, dreamy quality with flowing forms that suggest the fluid nature of fate and destiny.`,

    // Minimalist design
    minimalist: `Generate a minimalist design representing "${title}". Use clean lines, negative space, and a limited color palette to express the essence of "${keyword}" as a divinatory concept. The composition should be elegant and impactful through its simplicity, suggesting profound meaning through minimal elements.`,

    // Futuristic/Tech style
    futuristic: `Create a futuristic visualization for "${title}" that blends advanced technology with mystical divination. Incorporate elements related to "${keyword}" with digital oracles, holographic prophecies, or technological scrying tools. Use a dark background with vibrant glowing elements to create a sense of modern mysticism and digital enlightenment.`,

    // Fantasy/Magical style
    fantasy: `Design a fantasy illustration for "${title}" centered around prophetic or divinatory themes. Incorporate magical elements related to "${keyword}" with enchanted tools of foresight, mystical beings with prophetic abilities, or magical environments where the future is revealed. Use rich colors and dramatic lighting to create an immersive world where destiny unfolds.`
  }

  let selectedPrompt: string

  if (style && stylePrompts[style]) {
    // 如果指定了有效的风格，使用该风格
    selectedPrompt = stylePrompts[style]
  } else {
    // 如果没有指定风格或指定的风格无效，随机选择一个
    const styles = Object.keys(stylePrompts)
    const randomIndex = Math.floor(Math.random() * styles.length)
    selectedPrompt = stylePrompts[styles[randomIndex]]
  }

  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: selectedPrompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9'
    }
  })

  if (!response.generatedImages || response.generatedImages.length === 0) {
    throw new Error('Failed to generate image')
  }

  const imgBytes = response.generatedImages[0].image?.imageBytes
  const buffer = Buffer.from(imgBytes!, 'base64')

  const r2 = createR2()
  const sanitizedKeyword = keyword
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const filename = `${Date.now()}-${sanitizedKeyword}-cover-image.png`
  await r2.put(filename, buffer, {
    httpMetadata: {
      contentType: 'image/png'
    }
  })

  return `${process.env.NEXT_PUBLIC_R2_DOMAIN}/${filename}`
}

export async function getSpecificPosts(slugs: string[]) {
  const db = createDb()
  return db.select().from(posts).where(inArray(posts.slug, slugs)).execute()
}

// 校验翻译结果，必须包含所有目标语言且每个字段非空
function validateTranslationResult(result: Record<string, Record<string, string>>, allLocaleCodes: string[]): boolean {
  let failed = false
  for (const code of allLocaleCodes) {
    if (!result[code]) {
      console.error(`[翻译失败] 缺少目标语言: ${code}`)
      failed = true
    } else {
      // 检查所有字段都非空
      const values = Object.values(result[code] || {})
      if (values.length === 0 || values.some((v) => v === undefined || v === null || String(v).trim() === '')) {
        console.error(`[翻译失败] 语言 ${code} 的内容为空或缺失:`, result[code])
        failed = true
      }
    }
  }
  if (failed) {
    console.error('[翻译失败] AI返回内容：', result)
    return false
  }
  return true
}

// 批量翻译多个字段到多个语言，AI 返回 JSON 用特殊标记包裹，正则提取
export async function translateFieldsToLocales({
  fields,
  targetLanguages
}: {
  fields: Record<string, string>
  targetLanguages: string[]
}): Promise<Record<string, Record<string, string>>> {
  // 过滤只保留在locales里的目标语言
  const validLocales = locales.filter((l) => targetLanguages.includes(l.code))
  // 生成 code-name 列表
  const localeInfo = validLocales.map((l) => `${l.code}（${l.name}）`).join(', ')
  const allLocaleCodes = validLocales.map((l) => l.code)

  // system prompt: 固定格式和注意事项
  const systemPrompt = `
You are a professional AI translation assistant.
Your job is to translate the given fields into the specified target languages, ensuring natural, idiomatic, and culturally appropriate translations.

Requirements:
1. Translate according to each language's code, user language habits, and cultural background.
2. Ensure the translation is natural and idiomatic, avoid literal translation, and polish appropriately to fit local user expressions.
3. For industry terms or proper nouns, use the commonly used expressions in that language.
4. Keep the original field semantics accurate and style consistent.
5. The returned JSON result must use ONLY the language code as key (e.g. "zh", "ja", ...), do NOT include language name.
6. Return ONLY the JSON result, do not add any explanation or extra content.
7. [You MUST strictly include ALL target languages provided by the user]
8. If a word or phrase cannot be naturally translated, keep the original text in the translation, and maintain its capitalization.
9. The output format MUST strictly follow the example below, with nothing omitted:

TRANSLATION_RESULT_START
{
  "zh": { "content": "...", "description": "..." },
  "ja": { "content": "...", "description": "..." },
  ...
}
TRANSLATION_RESULT_END`

  // user prompt: 只传递本次目标语言和字段内容
  const userPrompt = `Please translate the following fields into the target languages: ${localeInfo}.
Fields to translate (original text):${JSON.stringify(fields, null, 2)}`

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  })

  const model = 'gemini-2.5-flash-lite-preview-06-17'
  const chat = ai.chats.create({
    model,
    config: {
      maxOutputTokens: 65535,
      temperature: 0.2,
      topP: 0.9,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    }
  })

  const response = await chat.sendMessage({
    message: [{ text: userPrompt }]
  })
  const match = response.text?.match(/TRANSLATION_RESULT_START([\s\S]*?)TRANSLATION_RESULT_END/)
  if (match) {
    try {
      const result = JSON.parse(match[1].trim())
      if (!validateTranslationResult(result, allLocaleCodes)) {
        return {}
      }
      return result
    } catch (e) {
      throw e
    }
  }
  return {}
}
export type ImageRatio = '1:1' | '16:9' | '4:3' | '3:2' | '9:16' | 'custom'
export type ImageStyle = 'realistic' | 'artistic' | 'anime' | 'cinematic' | 'fantasy' | 'abstract'

interface ImageGenerationOptions {
  prompt: string
  negativePrompt?: string
  ratio?: ImageRatio
  style?: ImageStyle
  customWidth?: number
  customHeight?: number
  steps?: number
  seed?: number
}
const styleEnhancers: Record<ImageStyle, string> = {
  realistic: 'highly detailed, photorealistic, sharp focus, professional photography, 8k',
  artistic: 'artistic style, vibrant colors, expressive, detailed brushstrokes, creative composition',
  anime: 'anime style, cel shading, vibrant colors, detailed, clean lines, 2D illustration',
  cinematic: 'cinematic lighting, dramatic composition, movie scene, high production value, film grain',
  fantasy: 'fantasy art, magical atmosphere, ethereal lighting, detailed environment, vibrant colors',
  abstract: 'abstract art, non-representational, geometric shapes, bold colors, expressive composition'
}
const styleNegativePrompts: Record<ImageStyle, string> = {
  realistic:
    'cartoon, illustration, drawing, painting, anime, blurry, low resolution, distorted, deformed, text, watermark',
  artistic: 'photorealistic, blurry, low quality, distorted, deformed, text, watermark',
  anime: 'photorealistic, blurry, low quality, 3D, distorted, deformed, text, watermark',
  cinematic:
    'cartoon, illustration, drawing, painting, anime, blurry, low resolution, distorted, deformed, text, watermark',
  fantasy: 'blurry, low quality, distorted, deformed, text, watermark',
  abstract: 'photorealistic, blurry, low quality, distorted, deformed, text, watermark'
}
function getDimensions(
  ratio: ImageRatio,
  customWidth?: number,
  customHeight?: number
): { width: number; height: number } {
  if (ratio === 'custom' && customWidth && customHeight) {
    return { width: customWidth, height: customHeight }
  }

  switch (ratio) {
    case '1:1':
      return { width: 1024, height: 1024 }
    case '16:9':
      return { width: 1280, height: 720 }
    case '4:3':
      return { width: 1024, height: 768 }
    case '3:2':
      return { width: 1200, height: 800 }
    case '9:16':
      return { width: 720, height: 1280 }
    default:
      return { width: 1024, height: 1024 }
  }
}

export async function cloudflareTextToImage({
  prompt,
  negativePrompt,
  ratio = '16:9',
  style = 'realistic',
  customWidth,
  customHeight,
  steps = 8,
  seed
}: ImageGenerationOptions) {
  try {
    const ai = createAI()
    const r2 = createR2()

    const enhancedPrompt = `${prompt}, ${styleEnhancers[style]}`

    const finalNegativePrompt = negativePrompt
      ? `${negativePrompt}, ${styleNegativePrompts[style]}`
      : styleNegativePrompts[style]

    const { width, height } = getDimensions(ratio, customWidth, customHeight)

    const response = await ai.run('@cf/bytedance/stable-diffusion-xl-lightning', {
      prompt: enhancedPrompt,
      negative_prompt: finalNegativePrompt,
      height,
      width,
      num_steps: steps,
      seed: seed || Math.floor(Math.random() * 2147483647)
    })

    const reader = response.getReader()
    const chunks: Uint8Array[] = []
    let done, value

    while ((({ done, value } = await reader.read()), !done)) {
      chunks.push(value!)
    }

    const imageBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
    let offset = 0
    for (const chunk of chunks) {
      imageBuffer.set(chunk, offset)
      offset += chunk.length
    }

    const base64Image = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`

    const sanitizedPrompt = prompt.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30)
    const timestamp = Date.now()
    const filename = `${timestamp}-${sanitizedPrompt}-${width}x${height}.png`

    try {
      await r2.put(filename, imageBuffer, {
        httpMetadata: {
          contentType: 'image/png'
        }
      })
    } catch (r2Error) {
      console.error('Error storing image in R2:', r2Error)
    }

    return {
      success: true,
      imageData: base64Image,
      imageUrl: `${process.env.NEXT_PUBLIC_R2_DOMAIN}/${filename}`,
      error: null,
      metadata: {
        prompt: enhancedPrompt,
        negativePrompt: finalNegativePrompt,
        width,
        height,
        steps,
        seed,
        style,
        timestamp
      }
    }
  } catch (error) {
    console.error('Error generating image:', error)
    return {
      success: false,
      imageData: null,
      imageUrl: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function generateArticleCoverImage(articleContent: string, title: string) {
  const cloudflareAI = createAI()

  const promptGenerationResult = await cloudflareAI.run('@cf/meta/llama-4-scout-17b-16e-instruct', {
    messages: [
      {
        role: 'system',
        content: `You are an expert at creating Stable Diffusion prompts. 
          
          Create a prompt for a 16:9 cover image that represents the article's main theme.
          
          Guidelines for the prompt:
          - Use a comma-separated list of keywords and short phrases
          - Include visual elements, style descriptors, and mood indicators
          - Focus on concrete visual elements rather than abstract concepts
          - Include 5-20 keywords maximum
          - DO NOT use full sentences or narrative descriptions
          - DO NOT include negative prompts
          - DO NOT include quotation marks or other formatting
          
          Example good prompts:
          - mountain landscape, sunrise, golden light, fog, dramatic vista, 16k
          - business meeting, professional setting, modern office, teamwork, corporate
          - healthy food, fresh vegetables, vibrant colors, wooden table, soft lighting`
      },
      {
        role: 'user',
        content: `Create a Stable Diffusion prompt for a cover image for an article titled: "${title}". 
          
          Here's the beginning of the article content for context: "${articleContent.substring(0, 500)}..."
          
          Return ONLY the comma-separated keywords without any explanation or additional text.`
      }
    ],
    stream: false
  })

  let imagePrompt = title
  if (typeof promptGenerationResult === 'object') {
    // Clean up the response to ensure it's just the keywords
    const response = promptGenerationResult.response.trim()
    // Remove any explanatory text, quotation marks, or other formatting
    imagePrompt = response
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^(prompt:|keywords:|here's a prompt:|stable diffusion prompt:)/i, '') // Remove prefixes
      .replace(/\.$/g, '') // Remove trailing period
      .trim()
  }

  // Generate the cover image using the created prompt
  const imageResult = await cloudflareTextToImage({
    prompt: imagePrompt,
    ratio: '16:9',
    style: 'cinematic', // Using cinematic style for professional-looking cover images
    steps: 12, // Higher quality generation
    negativePrompt: 'text, watermark, signature, blurry, distorted, low quality, disfigured'
  })

  return imageResult.imageUrl
}
