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

export type HubifyTookPayload<K extends keyof HubifyHooks> = Parameters<HubifyHooks[K]>[0]

export interface HubifyHooks extends ItemsHooks, CollectionHooks {}

export type ScopedHubifyHooks = {
  [K in keyof HubifyHooks as K extends `${string}:${string}` ? K : never]: HubifyHooks[K]
}
