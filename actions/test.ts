'use server'

import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function ServerLessActiveTimesTest(n: number) {
  await new Promise((r) => setTimeout(r, n * 1000))
}

export async function enqueueDurableObjectTask(taskData: any) {
  const queue = getCloudflareContext().env.NEXT_CACHE_DO_QUEUE

  // Get the Durable Object stub
  const queueId = queue?.idFromName('default-queue')
  if (queueId) {
    const queueStub = queue?.get(queueId)

    // Send a request to the Durable Object
    await queueStub?.revalidate(taskData)
  }
}
