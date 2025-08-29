import type { QueryParams } from '@hubify/restql'
import { whereValidation } from '@hubify/api/lib/validation'

export type Where<T extends TableNames> = QueryParams<Schema, T>['where']

export function useQueryWhere<T extends TableNames>(table: T) {
/**
 * Where query model.
 */
  const where = useRouteQuery<string, Where<T>>('where', undefined, {
    mode: 'replace',
    transform: {
      get: value => value ? JSON.parse(value) : undefined,
      set: value => JSON.stringify(value)
    }
  })

  /**
   * Validated where.
   */
  const validatedWhere = ref<Where<T>>()

  watchEffect(() => {
    const newValue = whereValidation(table).safeParse(where.value).data as Where<T> | undefined
    if (JSON.stringify(newValue) !== JSON.stringify(validatedWhere.value)) {
      validatedWhere.value = newValue
    }
  })

  return {
    where,
    validatedWhere
  }
}
