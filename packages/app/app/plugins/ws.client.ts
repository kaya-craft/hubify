import type { ScopedHubifyHooks } from '@hubify/api/hooks'

export default defineNuxtPlugin(() => {
  if (typeof globalThis.WebSocket === 'undefined') return

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
