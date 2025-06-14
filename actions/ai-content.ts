'use server'

import { GoogleGenAI } from '@google/genai'
import { count, desc, eq, inArray } from 'drizzle-orm'

import { locales } from '@/i18n/routing'
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
    const model = 'gemini-2.5-pro-preview-06-05'

    const chat = ai.chats.create({
      model: model,
      config: {
        maxOutputTokens: 65535,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        frequencyPenalty: 0.5,
        presencePenalty: 0.3,
        tools: [
          {
            googleSearch: {
              timeRangeFilter: {
                startTime: '2025-01-01T00:00:00Z',
                endTime: '2026-01-01T00:00:00Z'
              }
            }
          }
        ],
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

    const coverImageUrl = await generateAndUploadCoverImage(extractedTitle, keyword)

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
