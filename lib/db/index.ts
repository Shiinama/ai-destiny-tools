import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle as drizzleLocal } from 'drizzle-orm/d1'
import { drizzle as DrizzleProxy } from 'drizzle-orm/sqlite-proxy'

import { d1HttpDriver } from '@/lib/db/d1-http-driver'

import * as schema from './schema'

import type { AsyncRemoteCallback } from 'drizzle-orm/sqlite-proxy'

const wrappedDriver: AsyncRemoteCallback = async (
  sql: string,
  params: unknown[],
  method: 'all' | 'run' | 'get' | 'values'
) => {
  if (method === 'values') {
    const result = await d1HttpDriver(sql, params, 'all')
    return result
  }
  return d1HttpDriver(sql, params, method)
}

export const createDb = () => {
  if (process.env.NEXT_PUBLIC_DB_PROXY === '1') {
    return DrizzleProxy(wrappedDriver, { schema }) as any // env 需要设置数据库id
  }
  return drizzleLocal(getCloudflareContext().env.DB, { schema })
}

export type Db = ReturnType<typeof createDb>
