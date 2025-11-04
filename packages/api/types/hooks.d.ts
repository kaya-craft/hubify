type HookEventType = 'updated' | 'created' | 'deleted'

type ItemsHooks = {
  [K in HookEventType as `items:${K}`]: <T extends TableNames>(payload: ItemPayload<K, T>) => void
} & {
  items: <T extends TableNames>(payload: ItemPayload<K, T> & { type: HookEventType }) => void
}

type CollectionHooks = {
  [K in HookEventType as `collection:${K}`]: <T extends TableNames>(payload: { collection: T }) => void
} & {
  collection: <T extends TableNames> (payload: { collection: T, type: HookEventType }) => void
}

type ItemPayload<K extends keyof ItemsHooks, T extends TableNames> = K extends 'created' ? {
  collection: T
  item: TableItem<T>
} : {
  collection: T
  item: Record<TablePrimaryKey<T>, TablePrimaryKeyValue<T>>
}

type TableHooks = {
  [K in HookEventType as `table:${K}`]: <T extends TableNames> (payload: { table: T }) => void
} & {
  table: <T extends TableNames>(payload: { table: T, type: HookEventType }) => void
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
