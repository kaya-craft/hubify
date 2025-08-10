import type { ScopedHubifyHooks } from '@/utils/hooks'

export default defineNuxtPlugin(() => {
  const ws = new WebSocket('/ws/public')

  ws.onmessage = async (event) => {
    try {
      const obj = JSON.parse(await event.data.text()) as {
        type: keyof ScopedHubifyHooks
        data: Parameters<ScopedHubifyHooks[keyof ScopedHubifyHooks]>[0]
      }

      callHubifyHook(obj.type, obj.data)
    }
    catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }
})
