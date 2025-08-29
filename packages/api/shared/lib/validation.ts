import type { TableName } from '@hubify/restql'
import z from 'zod'
import tables from '#hubify/schema'
import { columnTypeToOperators } from './column-types'

/**
 * Special validation for the `where` clause in query parameters.
 */
export function whereValidation<T extends TableName<Schema>>(
  collection: T
) {
  const columns = Object.entries(tables[collection].columns)

  const obj = columns.reduce((acc, [column, def]) => {
    const operators = columnTypeToOperators(def)
    acc[column] = z.strictObject({
      ...operators.reduce((opAcc, operator) => {
        opAcc[operator] = z.any().optional()
        return opAcc
      }, {} as Record<typeof operators[number], z.ZodTypeAny>)
    }).transform(asNonEmptyObject).optional()
    return acc
  }, {} as Record<string, z.ZodTypeAny>)

  const rule = z.strictObject(obj).transform(asNonEmptyObject)

  Object.assign(obj, {
    get $and() {
      return z.array(rule).transform(asNonEmptyArray).optional()
    },
    get $or() {
      return z.array(rule).transform(asNonEmptyArray).optional()
    }
  })

  return rule
}

/**
 * Helper function to convert an array to a Zod schema that validates as an array of enums.
 */
export function asEnumArray<T extends string>(arr: T[]) {
  return z.preprocess(value => typeof value === 'string' ? value.split(',') : value, z.array(z.enum(arr)))
}

/**
 * Helper function to convert a stringified object to an object.
 */
export function asObject<T extends z.core.SomeType>(type: T) {
  return z.preprocess(value => typeof value === 'string' ? JSON.parse(value) : value, type)
}

/**
 * Helper function to ensure objects are not empty.
 */
export function asNonEmptyObject(value: Record<string, unknown>) {
  const newValue = Object.fromEntries(Object.entries(value).filter(([_, value]) => isNotEmpty(value)))
  return Object.keys(newValue).length > 0 ? newValue : undefined
}

/**
 * Helper function to ensure arrays are not empty.
 */
export function asNonEmptyArray(value: unknown[]) {
  const newValue = value.filter(isNotEmpty)
  return newValue.length > 0 ? newValue : undefined
}
