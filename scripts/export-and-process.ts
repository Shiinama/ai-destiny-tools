#!/usr/bin/env node

import { exportToolDomains } from '../lib/similarweb'

async function main() {
  try {
    const baseUrl = 'http://localhost:3000'

    await exportToolDomains('./tool-domains.json', baseUrl)
  } catch (error) {
    console.error('❌ 执行失败:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
