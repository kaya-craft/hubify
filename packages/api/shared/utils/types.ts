type TypeOf<T, U> = Extract<T, U> extends never
  ? U extends T
    ? U
    : Extract<T, U>
  : Extract<T, U>

/**
 *  Check whether the value is a string
 */
export function isString<T>(value: T): value is TypeOf<T, string> {
  return typeof value === 'string'
}

/**
 * Check whether the value is an object
 */
export function isObject<T>(value: T): value is TypeOf<T, object> {
  return typeof value === 'object' && value !== null
}

/**
 * Check whether the value is an array
 */
export function isArray<T>(value: T): value is TypeOf<T, unknown[]> {
  return Array.isArray(value)
}

/**
 * Check whether the value is a function
 */
export function isFunction<T>(
  value: T
): value is TypeOf<T, (...args: never[]) => unknown> {
  return typeof value === 'function'
}

/**
 * Check whether the value is a number
 */
export function isNumber<T>(value: T): value is TypeOf<T, number> {
  return typeof value === 'number' && !Number.isNaN(value)
}

/**
 * Check whether the value is a boolean
 */
export function isBoolean<T>(value: T): value is TypeOf<T, boolean> {
  return typeof value === 'boolean'
}

/**
 * Check whether the value is undefined
 */
export function isUndefined<T>(value: T): value is TypeOf<T, undefined> {
  return typeof value === 'undefined'
}

/**
 * Check whether the value is null
 */
export function isNull<T>(value: T): value is TypeOf<T, null> {
  return value === null
}

/**
 * Check whether the value is non nullable.
 */
export function isNullish<T>(value: T): value is TypeOf<T, null | undefined> {
  return isUndefined(value) || isNull(value)
}

/**
 * Check whether the value is non nullable.
 */
export function isNonNullish<T>(
  value: T
): value is Exclude<T, null | undefined> {
  return !isNullish(value)
}

/**
 * Check whether the value is empty.
 */
export function isEmpty<T>(value: T) {
  return (
    isNullish(value)
    || (isString(value) && value.trim().length === 0)
    || (isArray(value) && value.length === 0)
  )
}

/**
 * Check whether the value is not empty.
 */
export function isNotEmpty<T>(value: T) {
  return !isEmpty(value)
}

/**
 * Check whether the value is an error
 */
export function isStatusError(value: unknown, status: number): value is Error {
  return (
    value instanceof Error
    && 'statusCode' in value
    && value.statusCode === status
  )
}
