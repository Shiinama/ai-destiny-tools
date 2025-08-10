'use server'
import { readFileSync, writeFileSync } from 'fs'

// SimilarWeb 数据接口类型
export interface SimilarWebResponse {
  Version: number
  SiteName: string
  Description: string | null
  TopCountryShares: Array<{
    Country: number
    CountryCode: string
    Value: number
  }>
  Title: string | null
  Engagments: {
    BounceRate: string
    Month: string
    Year: string
    PagePerVisit: string
    Visits: string
    TimeOnSite: string
  }
  EstimatedMonthlyVisits: Record<string, number>
  GlobalRank: {
    Rank: number
  }
  CountryRank: {
    Country: string | null
    CountryCode: string | null
    Rank: number | null
  }
  CategoryRank: {
    Rank: number | null
    Category: string | null
  }
  GlobalCategoryRank: {
    Rank: number | null
    Category: string | null
  }
  IsSmall: boolean
  Policy: number
  TrafficSources: {
    Social: number
    'Paid Referrals': number
    Mail: number
    Referrals: number
    Search: number
    Direct: number
  }
  Category: string
  LargeScreenshot: string
  IsDataFromGa: boolean
  Countries: Array<{
    Code: string
    UrlCode: string
    Name: string
  }>
  Competitors: {
    TopSimilarityCompetitors: any[]
  }
  Notification: {
    Content: string | null
  }
  TopKeywords: Array<{
    Name: string
    EstimatedValue: number
    Volume: number
    Cpc: number | null
  }>
  SnapshotDate: string
}

// 域名和工具ID的映射
export interface DomainToolMapping {
  domain: string
  toolId: string
}

// 处理结果
export interface ProcessResult {
  domain: string
  toolId: string
  success: boolean
  data?: Record<string, number>
  error?: string
}

// 从域名获取 SimilarWeb 数据
async function fetchSimilarWebData(domain: string): Promise<SimilarWebResponse | null> {
  try {
    const apiUrl = `https://data.similarweb.com/api/v1/data?domain=${encodeURIComponent(domain)}`
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; SimilarWeb-Bot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data as SimilarWebResponse
  } catch (error) {
    return null
  }
}

// 处理单个域名并保存到数据库
export async function processSingleDomain(
  domain: string,
  toolId: string,
  baseUrl: string = 'http://localhost:3000'
): Promise<ProcessResult> {
  try {
    // 获取 SimilarWeb 数据
    const apiResponse = await fetchSimilarWebData(domain)

    if (!apiResponse || !apiResponse.EstimatedMonthlyVisits) {
      return {
        domain,
        toolId,
        success: false,
        error: '无法获取或数据格式不正确'
      }
    }

    // 保存到数据库
    const response = await fetch(`${baseUrl}/api/similarweb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        toolId,
        similarWebData: apiResponse
      })
    })

    if (response.ok) {
      return {
        domain,
        toolId,
        success: true,
        data: apiResponse.EstimatedMonthlyVisits
      }
    } else {
      const errorText = await response.text()
      return {
        domain,
        toolId,
        success: false,
        error: `存储到数据库失败: ${response.status} ${errorText}`
      }
    }
  } catch (error) {
    return {
      domain,
      toolId,
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 处理所有域名
export async function processAllDomains(
  domainMappings: DomainToolMapping[],
  baseUrl: string = 'http://localhost:3000'
): Promise<ProcessResult[]> {
  const results: ProcessResult[] = []

  for (let i = 0; i < domainMappings.length; i++) {
    const mapping = domainMappings[i]

    // 处理单个域名
    const result = await processSingleDomain(mapping.domain, mapping.toolId, baseUrl)
    results.push(result)

    // 显示进度
    const progress = (((i + 1) / domainMappings.length) * 100).toFixed(1)
    const status = result.success ? '✅' : '❌'
    // eslint-disable-next-line no-console
    console.log(`${status} [${progress}%] ${mapping.domain}`)

    // 添加延迟，避免API限制
    if (i < domainMappings.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return results
}

// 从 API 获取工具域名并保存成文件
export async function exportToolDomains(
  outputPath: string = './tool-domains.json',
  baseUrl: string = 'http://localhost:3000'
): Promise<void> {
  try {
    const response = await fetch(`${baseUrl}/api/similarweb/export-domains`)

    if (!response.ok) {
      throw new Error('获取工具域名失败')
    }

    const result = (await response.json()) as {
      success: boolean
      count: number
      data: DomainToolMapping[]
      error?: string
    }

    if (!result.success) {
      throw new Error(result.error || '获取工具域名失败')
    }

    const content = JSON.stringify(result.data, null, 2)
    writeFileSync(outputPath, content, 'utf-8')

    // eslint-disable-next-line no-console
    console.log(`✅ 已导出 ${result.count} 个工具域名`)
  } catch (error) {
    console.error('❌ 导出工具域名失败:', error)
    throw error
  }
}

// 从本地 JSON 文件读取域名映射
export async function loadDomainMappingsFromFile(
  filePath: string = './tool-domains.json'
): Promise<DomainToolMapping[]> {
  try {
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as DomainToolMapping[]
  } catch (error) {
    console.error('❌ 读取域名映射文件失败:', error)
    return []
  }
}

// 使用本地文件处理所有域名
export async function processDomainsFromFile(
  filePath: string = './tool-domains.json',
  baseUrl: string = 'http://localhost:3000'
): Promise<ProcessResult[]> {
  const domainMappings = await loadDomainMappingsFromFile(filePath)

  if (domainMappings.length === 0) {
    return []
  }
  return await processAllDomains(domainMappings, baseUrl)
}
