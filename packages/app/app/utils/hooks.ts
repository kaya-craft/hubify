import 'nuxt/app'
import type { HubifyHooks, HubifyTookPayload, ScopedHubifyHooks } from '@hubify/api/hooks'

/**
 * Call a Hubify hook with the given payload.
 * This will call the hook in the format `hubify:scope:type`.
 * It will also call the hook in the format `hubify:scope` with the type included in the payload.
 */
export function callHubifyHook<K extends keyof ScopedHubifyHooks>(hook: K, payload: HubifyTookPayload<K>) {
  const nuxtApp = useNuxtApp()
  const [scope, type] = extractScopeAndType(hook)
  const result = nuxtApp.callHook(`hubify:${scope}:${type}`, payload)
  nuxtApp.callHook(`hubify:${scope}`, { type, ...payload })
  return result
}

/**
 * Register a callback for a Hubify hook.
 */
export function onHubifyHook<K extends keyof HubifyHooks>(hook: K, callback: HubifyHooks[K]) {
  const nuxtApp = useNuxtApp()
  const hookName = `hubify:${hook}` as const
  // @ts-expect-error The type of `callback` is inferred from the hook name
  return nuxtApp.hook(hookName, callback)
}

function extractScopeAndType<K extends keyof ScopedHubifyHooks>(hook: K) {
  return hook.split(':') as K extends `${infer Scope}:${infer Type}` ? [Scope, Type] : never
}

type HubifyRuntimeHooks = {
  [K in keyof HubifyHooks as `hubify:${K}`]: HubifyHooks[K]
}

declare module 'nuxt/app' {
  interface RuntimeNuxtHooks extends HubifyRuntimeHooks {}
}
