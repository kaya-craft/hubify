import { whereValidation } from '@hubify/api/lib/validation'
import type { QueryParams } from '@hubify/restql'
import { defu } from 'defu'

export function useQueryRouter<T extends TableNames>(table: T, baseQueryRouter?: MaybeRefOrGetter<QueryParams<Schema, T>>) {
  /**
   * Where query model.
   */
  const queryWhere = useRouteQuery<string, QueryParams<Schema, T>['where']>('where', undefined, {
    mode: 'replace',
    transform: {
      get: value => value ? JSON.parse(value) : undefined,
      set: value => JSON.stringify(value)
    }
  })

  /**
   * Where state.
   */
  const where = computed<QueryParams<Schema, T>['where']>(() => {
    return defu(toValue(toValue(baseQueryRouter)?.where), toValue(queryWhere)) as QueryParams<Schema, T>['where']
  })

  /**
   * Validated where.
   */
  const validatedWhere = ref<QueryParams<Schema, T>['where']>()

  /**
   * Offset query model.
   */
  const queryOffset = useRouteQuery<string, QueryParams<Schema, T>['offset']>('offset', undefined, {
    mode: 'replace',
    transform(val) {
      const offset = Number(val)
      if (isNaN(offset) || offset < 1) return
      return offset
    }
  })

  /**
   * Limit query model.
   */
  const queryLimit = useRouteQuery<string, QueryParams<Schema, T>['limit']>('limit', undefined, {
    mode: 'replace',
    transform(val) {
      const limit = Number(val)
      if (isNaN(limit) || limit < 1) return
      return limit
    }
  })

  /**
   * OrderBy query model.
   */
  const queryOrderBy = useRouteQuery<string, QueryParams<Schema, T>['orderBy']>('orderBy', undefined, {
    mode: 'replace'
  })

  /**
   * Watch for changes in the where and validate it.
   */
  watchEffect(() => {
    const newValue = whereValidation(table).safeParse(where.value)?.data as QueryParams<Schema, T>['where'] | undefined

    if (JSON.stringify(newValue) !== JSON.stringify(validatedWhere.value)) {
      validatedWhere.value = newValue
    }
  })

  return {
    where,
    queryWhere,
    queryLimit,
    queryOffset,
    queryOrderBy,
    validatedWhere
  }
}
