import type { FieldDefinition } from '@hubify/api/database/types'

/**
 * Define the current field accepted data types.
 * This is used to define the field data types in the `defineExpose` function.
 * It is used to provide type information for the field data types in the Vue SFC.
 */
export function defineFieldDataTypes(..._dataTypes: FieldDefinition['type'][]) {
  // return defineExpose({ dataTypes })
}

/**
 * Normalize JSON input value
 */
export function normalizeJSONValue<I, O>(value: MaybeRef<I>, onlyIf: MaybeRefOrGetter<boolean> = true): ComputedRef<O | null> {
  return computed({
    get() {
      const val = toValue(value)
      if (toValue(onlyIf) && isString(val)) {
        try {
          return JSON.parse(val)
        }
        catch {
          return null
        }
      }
      return val
    },
    set(val) {
      if (isRef(value)) {
        value.value = JSON.stringify(val) as unknown as I
      }
    }
  })
}
