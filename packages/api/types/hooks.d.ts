type HookEventType = 'updated' | 'created' | 'deleted'

type ItemsHooks = {
  [K in HookEventType as `items:${K}`]: <T extends TableNames>(payload: ItemPayload<K, T>) => void
} & {
  items: <T extends TableNames>(payload: ItemPayload<K, T> & { type: HookEventType }) => void
}

type CollectionHooks = {
  [K in HookEventType as `collection:${K}`]: (payload: { collection: TableNames }) => void
} & {
  collection: (payload: { collection: TableNames, type: HookEventType }) => void
}

type ItemPayload<K extends keyof ItemsHooks, T extends TableNames> = K extends 'deleted' ? {
  collection: T
  id: TablePrimaryKeyValue<T>
} : {
  collection: T
  item: TableItem<T>
}

type TableHooks = {
  [K in HookEventType as `table:${K}`]: (payload: { table: string }) => void
} & {
  table: (payload: { table: string, type: HookEventType }) => void
}

export type HubifyTookPayload<K extends keyof HubifyHooks> = Parameters<HubifyHooks[K]>[0]

export interface HubifyHooks extends ItemsHooks, CollectionHooks, TableHooks {}

export type ScopedHubifyHooks = {
  [K in keyof HubifyHooks as K extends `${string}:${string}` ? K : never]: HubifyHooks[K]
}

type HubifyRuntimeHooks = {
  [K in keyof HubifyHooks as `hubify:${K}`]: HubifyHooks[K]
}

declare module 'nitropack/types' {
  interface NitroRuntimeHooks extends HubifyRuntimeHooks {}
}
