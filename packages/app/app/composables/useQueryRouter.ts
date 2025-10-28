import { whereValidation } from '@hubify/api/validation'
import { defu } from 'defu'

export const DEFAULT_PAGE_SIZE = 10

export function useQueryRouter<T extends TableNames>(table: T, baseQueryRouter?: MaybeRefOrGetter<QueryParams<T>>) {
  /**
   * Current router.
   */
  const router = useRouter()

  /**
   * Current route.
   */
  const route = useRoute()

  /**
   * Base query.
   */
  const baseQuery = computed(() => {
    return toValue(baseQueryRouter)
  })

  /**
   * Where query.
   */
  const _where = useRouteQuery<string, QueryParams<T>['where']>('where', undefined, {
    mode: 'replace',
    transform: {
      get: value => defu(value ? JSON.parse(value) : {}, toValue(baseQuery)?.where),
      set: value => JSON.stringify(value)
    },
    router,
    route
  })

  /**
   * Get validated where query object.
   */
  function getValidatedWhere() {
    return whereValidation(table).safeParse(toValue(_where))?.data as QueryParams<T>['where'] | undefined
  }

  /**
   * Validated where query object.
   */
  const where = ref(getValidatedWhere())

  /**
   * Sync where query when the route changes.
   */
  watchEffect(() => {
    const newWhere = getValidatedWhere()
    if (JSON.stringify(newWhere) !== JSON.stringify(where.value)) {
      where.value = newWhere
    }
  })

  /**
   * Offset query model.
   */
  const offset = useRouteQuery<string, QueryParams<T>['offset']>('offset', undefined, {
    mode: 'replace',
    transform(val) {
      const offset = Number(val)
      if (Number.isNaN(offset) || offset < 1) return toValue(baseQuery)?.offset ?? 0
      return offset
    },
    router,
    route
  })

  /**
   * Limit query model.
   */
  const limit = useRouteQuery<string, QueryParams<T>['limit']>('limit', undefined, {
    mode: 'replace',
    transform(val) {
      const limit = Number(val)
      if (Number.isNaN(limit) || limit < 1) return toValue(baseQuery)?.limit ?? DEFAULT_PAGE_SIZE
      return limit
    },
    router,
    route
  })

  /**
   * OrderBy query model.
   */
  const orderBy = useRouteQuery<string, QueryParams<T>['orderBy']>('orderBy', undefined, {
    mode: 'replace',
    transform(val) {
      if (!val) return toValue(baseQuery)?.orderBy
      return JSON.parse(val) as QueryParams<T>['orderBy']
    },
    router,
    route
  })

  /**
   * Page number computed from offset and limit.
   */
  const page = computed({
    get() {
      return Math.floor((offset.value ?? 0) / (limit.value ?? DEFAULT_PAGE_SIZE)) + 1
    },
    set(pageNumber: number) {
      const newOffset = ((pageNumber - 1) * (limit.value ?? DEFAULT_PAGE_SIZE))
      offset.value = newOffset
    }
  })

  /**
   * Reactive query object.
   */
  const query = reactive({
    where,
    limit,
    offset,
    orderBy
  })

  return {
    page,
    where: _where,
    limit,
    offset,
    orderBy,
    query
  }
}
