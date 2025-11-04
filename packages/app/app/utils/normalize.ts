/**
 * Normalize JSON input value
 */
export function normalizeJSONValue<I, O = I>(value: MaybeRef<I>, onlyIf: MaybeRefOrGetter<boolean> = true): WritableComputedRef<O | null> {
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
