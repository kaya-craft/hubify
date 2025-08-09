import 'nuxt/app'

/**
 * Call a Hubify hook with the given payload.
 * This will call the hook in the format `hubify:scope:type`.
 * It will also call the hook in the format `hubify:scope` with the type included in the payload.
 */
export function callHubifyHook<K extends keyof ScopedHubifyHooks>(hook: K, payload: Parameters<ScopedHubifyHooks[K]>[0]) {
  const nuxtApp = useNuxtApp()
  const [scope, type] = extractScopeAndType(hook)
  const result = nuxtApp.callHook(`hubify:${scope}:${type}`, payload)
  nuxtApp.callHook(`hubify:${scope}`, { type, ...payload })
  return result
}

/**
 * Register a callback for a Hubify hook.
 */
export function onHubifyHook<K extends keyof Hooks>(hook: K, callback: Hooks[K]) {
  const nuxtApp = useNuxtApp()
  const hookName = `hubify:${hook}` as const
  // @ts-expect-error The type of `callback` is inferred from the hook name
  return nuxtApp.hook(hookName, callback)
}

function extractScopeAndType<K extends keyof ScopedHubifyHooks>(hook: K) {
  return hook.split(':') as K extends `${infer Scope}:${infer Type}` ? [Scope, Type] : never
}

type HookEventType = 'updated' | 'created' | 'deleted'

type ItemsHooks = {
  [K in HookEventType as `items:${K}`]: (payload: { collection: TableNames, id: TablePrimaryKeyValue<TableNames> }) => void
} & {
  items: (payload: { type: HookEventType, collection: TableNames, id: TablePrimaryKeyValue<TableNames> }) => void
}

type CollectionHooks = {
  [K in HookEventType as `collection:${K}`]: (payload: { collection: TableNames }) => void
} & {
  collection: (payload: { collection: TableNames, type: HookEventType }) => void
}

type HubifyHooks = {
  [K in keyof Hooks as `hubify:${K}`]: Hooks[K]
}

type ScopedHubifyHooks = {
  [K in keyof Hooks as K extends `${string}:${string}` ? K : never]: Hooks[K]
}

export interface Hooks extends ItemsHooks, CollectionHooks {}

declare module 'nuxt/app' {
  interface RuntimeNuxtHooks extends HubifyHooks {}
}
