/**
 * When `id` is provided, returns a single item; otherwise returns the list of items.
 */
export function useItems<T extends TableNames, P extends boolean = false>(
  collection: T,
  options?: UseItemsOptions<T, undefined, P>
): ReturnType<typeof useFetch<UseItemsOutput<T, undefined, P>>>

export function useItems<T extends TableNames, PK extends TablePrimaryKeyValue<T>>(
  collection: T,
  options: UseItemsOptions<T, PK, undefined>
): ReturnType<typeof useFetch<UseItemsOutput<T, PK>>>

export function useItems<T extends TableNames = TableNames, PK extends TablePrimaryKeyValue<T> | undefined = undefined, P extends boolean | undefined = undefined>(collection: T, options?: UseItemsOptions<T, PK, P>): ReturnType<typeof useFetch<UseItemsOutput>> {
  const url = computed(() => {
    if (!options || !('id' in options)) {
      return `/api/items/${collection}` as `/api/items/:collection`
    }

    return `/api/items/${collection}/${toValue(options.id)}` as `/api/items/:collection/:id`
  })

  const query = computed(() => {
    if (!options) return {}

    const baseQuery = toValue(options.query) || {}

    if ('id' in options) {
      return baseQuery
    }

    if ('paginate' in options && options.paginate !== undefined) {
      return {
        ...baseQuery,
        paginate: options.paginate
      }
    }

    return baseQuery
  })

  return useFetch(url, { query })
}

type UseItemsOutput<T extends TableNames = TableNames, PK extends TablePrimaryKeyValue<T> | undefined = undefined, P extends boolean | undefined = undefined>
  = PK extends undefined ? P extends true
    ? { items: TableItem<T>[], total: number, page: number, perPage: number }
    : TableItem<T>[]
    : TableItem<T>

type UseItemsOptions<T extends TableNames = TableNames, PK extends TablePrimaryKeyValue<T> | undefined = undefined, P extends boolean | undefined = undefined>
  = PK extends undefined ? {
    paginate?: P
    query?: ComputedRef<QueryParams<T>>
  } : {
    id: MaybeRef<PK>
    query?: ComputedRef<QueryParams<T>>
  }
