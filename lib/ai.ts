import { getCloudflareContext } from '@opennextjs/cloudflare'

export const createAI = () => getCloudflareContext().env.AI
