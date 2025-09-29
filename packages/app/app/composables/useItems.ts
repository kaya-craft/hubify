import type { QueryParams } from '@hubify/restql'

type ListItemsResponse<T extends TableNames> = { items: TableItem<T>[], total_count: number }
type SingleItemResponse<T extends TableNames> = TableItem<T>

/**
 * When `id` is provided, returns a single item; otherwise returns the list of items.
 */
export function useItems<T extends TableNames>(
  collection: T,
  options: { id: MaybeRef<string | number>, query?: ComputedRef<QueryParams<Schema, T>> }
): ReturnType<typeof useFetch<SingleItemResponse<T>>>

export function useItems<T extends TableNames>(
  collection: T,
  options?: { id?: undefined, query?: ComputedRef<QueryParams<Schema, T>> }
): ReturnType<typeof useFetch<ListItemsResponse<T>>>

export function useItems<T extends TableNames>(
  collection: T,
  { id, query }: { id?: MaybeRef<string | number>, query?: ComputedRef<QueryParams<Schema, T>> } = {}
) {
  const url = computed(() =>
    id
      ? `/api/items/${collection}/${toValue(id)}` as `/api/items/:collection/:id`
      : `/api/items/${collection}` as `/api/items/:collection`
  )

  return id
    ? useFetch<SingleItemResponse<T>>(url, { query })
    : useFetch<ListItemsResponse<T>>(url, { query })
}
