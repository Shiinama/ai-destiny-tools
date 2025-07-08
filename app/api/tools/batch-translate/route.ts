import { eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'

import { translateFieldsToLocales } from '@/actions/ai-content'
import { getAllTools, upsertToolTranslations } from '@/actions/divination-tools'
import { locales } from '@/i18n/routing'
import { createDb } from '@/lib/db'
import { divinationToolTranslations } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

async function getUntranslatedLocales(toolId: string, targetLocales: string[]): Promise<string[]> {
  const db = createDb()
  const rows = await db
    .select({ locale: divinationToolTranslations.locale, content: divinationToolTranslations.content })
    .from(divinationToolTranslations)
    .where(eq(divinationToolTranslations.toolId, toolId))
    .execute()
  // 已有且 content 不为空的 locale
  const translated = rows.filter((row) => row.content && row.content.trim() !== '').map((row) => row.locale)
  // 其余都需要翻译
  return targetLocales.filter((code) => !translated.includes(code))
}

export async function POST(req: NextRequest) {
  try {
    const page = 1
    const pageSize = 100
    const targetLocaleCodes = locales.filter((l) => l.code !== 'en').map((l) => l.code)
    let translatedCount = 0
    const failed: Array<{ id: string; error: string }> = []

    // 只处理一页
    const tools = await getAllTools(page, pageSize)
    for (const tool of tools) {
      if (!tool.content || !tool.description) continue
      const needTranslateLocales = await getUntranslatedLocales(tool.id, targetLocaleCodes)
      if (needTranslateLocales.length === 0) continue
      // eslint-disable-next-line no-console
      console.log('正在翻译工具', tool.id, tool.content, '目标语言:', needTranslateLocales)
      const translationsResult = await translateFieldsToLocales({
        fields: { content: tool.content, description: tool.description },
        targetLanguages: needTranslateLocales
      })

      const translations = needTranslateLocales.map((code) => ({
        locale: code,
        content: translationsResult[code]?.content || '',
        description: translationsResult[code]?.description || ''
      }))
      const upsertResult = await upsertToolTranslations(tool.id, translations)
      if (upsertResult.code === 0) {
        translatedCount++
      } else {
        failed.push({ id: tool.id, error: upsertResult.message })
      }
    }
    return Response.json({
      code: 0,
      message: `本页批量翻译完成，成功：${translatedCount}，失败：${failed.length}`,
      failed
    })
  } catch (error: any) {
    return Response.json({ code: 1, message: '批量翻译失败', error: error.message || String(error) })
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}
