import type { HubifyTookPayload, ScopedHubifyHooks } from '@hubify/api/types/hooks'

/**
 * Use websocket.
 */
export function useWebsocket(event = useEvent()) {
  const hostname = getRequestHost(event)
  const protocol = getRequestProtocol(event)
  const url = new URL('/ws/public', `${protocol}://${hostname}`)
  return new WebSocket(url)
}

/**
 * Emit a message to the WebSocket server.
 */
export async function emitMessage<K extends keyof ScopedHubifyHooks>(event = useEvent(), message: Message<K>) {
  return new Promise<void>((resolve) => {
    const ws = useWebsocket(event)
    ws.onopen = () => {
      ws.send(JSON.stringify(message))
      resolve()
    }
  })
}

type Message<K extends keyof ScopedHubifyHooks> = {
  type: K
  data: HubifyTookPayload<K>
}
