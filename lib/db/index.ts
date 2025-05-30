import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle } from 'drizzle-orm/d1'

import * as schema from './schema'

export const createDb = () => drizzle(getCloudflareContext().env.DB, { schema })

export type Db = ReturnType<typeof createDb>
