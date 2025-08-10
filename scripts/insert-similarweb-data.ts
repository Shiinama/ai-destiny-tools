#!/usr/bin/env node

import { loadDomainMappingsFromFile, processAllDomains } from '../lib/similarweb'

async function main() {
  try {
    const baseUrl = 'http://localhost:3000'
    const domainsFile = './tool-domains.json'

    const domainMappings = await loadDomainMappingsFromFile(domainsFile)

    if (domainMappings.length === 0) {
      console.log('❌ 没有找到域名映射数据')
      process.exit(1)
    }

    console.log(`处理 ${domainMappings.length} 个域名...`)

    const results = await processAllDomains(domainMappings, baseUrl)

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    console.log(`完成: ${successCount} 成功, ${failCount} 失败`)
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
