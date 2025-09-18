import type { QueryParams } from '@hubify/restql'

export function useItems<T extends TableNames>(collection: T, query?: ComputedRef<QueryParams<Schema, T>>) {
  return useFetch<{ items: TableItem<T>[], total_count: number }>(`/api/items/${collection}` as `/api/items/:collection`, {
    query
  })
}
