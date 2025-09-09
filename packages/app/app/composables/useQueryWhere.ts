import { whereValidation } from '@hubify/api/lib/validation'
import { defu } from 'defu'

export type Where<T extends TableNames> = QueryParams<T>['where']

export function useQueryWhere<T extends TableNames>(table: T, baseWhere?: MaybeRefOrGetter<Where<T>>) {
/**
 * Where query model.
 */
  const queryWhere = useRouteQuery<string, Where<T>>('where', undefined, {
    mode: 'replace',
    transform: {
      get: value => value ? JSON.parse(value) : undefined,
      set: value => JSON.stringify(value)
    }
  })

  /**
   * Where state.
   */
  const where = computed<Where<T>>(() => {
    return defu(toValue(baseWhere), toValue(queryWhere)) as Where<T>
  })

  /**
   * Validated where.
   */
  const validatedWhere = ref<Where<T>>()

  /**
   * Watch for changes in the where and validate it.
   */
  watchEffect(() => {
    const newValue = whereValidation(table).safeParse(where.value)?.data as Where<T> | undefined

    if (JSON.stringify(newValue) !== JSON.stringify(validatedWhere.value)) {
      validatedWhere.value = newValue
    }
  })

  return {
    where,
    queryWhere,
    validatedWhere
  }
}
