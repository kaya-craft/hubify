import z from 'zod'
import tables from '#hubify/schema'
import { getDataTypeOperators, getDataTypeValidator } from './database/data-types'
import type { ColumnDefinition, FieldDefinition, Operator } from './database/types'
import { isColumn, isRelation } from './database/helpers'

/**
 * Special validation for the `where` clause in query parameters.
 */
export function whereValidation<T extends TableNames>(collection: T) {
  const obj = getTableValidators(collection)

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
 * Get table column operators.
 */
function getTableValidators<T extends TableNames>(table: T) {
  return Object.entries(tables[table]).reduce((acc, [column, def]) => {
    if (isRelation(def)) return acc
    acc[column] = z.strictObject(getColumnValidators(def)).optional()
    return acc
  }, {} as Record<string, z.ZodTypeAny>)
}

/**
 * Get column operators validators.
 */
function getColumnValidators(def: ColumnDefinition) {
  return getDataTypeOperators(def.type).reduce((opAcc, operator) => {
    opAcc[operator] = columnValidation(def, operator).optional()
    return opAcc
  }, {} as Record<Operator, z.ZodTypeAny>)
}

/**
 * Item validation.
 */
export function itemValidation<T extends TableNames>(collection: T, options: ItemValidationOptions = {}) {
  const columns = tables[collection]

  const columnSchemas = Object.fromEntries(
    Object.entries(columns).map(([name, column]) => {
      if (!options.includePrimaryKey && column.primaryKey) return

      const rule = columnValidation(column, '$eq')

      if (!column.notNull) {
        return [name, rule.optional().nullable()]
      }

      if (options.optional || !isUndefined(column.default)) {
        return [name, rule.optional()]
      }

      return [name, rule]
    }).filter(isNonNullish)
  )

  return z.strictObject(columnSchemas)
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

/**
 * Column validation type.
 */
function columnValidation(column: FieldDefinition, operator: Operator) {
  if (isColumn(column)) {
    if (expectsBooleanValue(operator)) {
      return z.boolean()
    }

    const validator = getDataTypeValidator(column.type)

    if (expectsArrayValue(operator)) {
      return z.array(validator(column))
    }

    return validator(column)
  }

  const table = column.type === 'one-to-many' ? column.table : column.through
  const relatedColumn = column.type === 'one-to-many' ? column.foreignKey : column.throughKey
  const relatedTable = tables[table as keyof typeof tables]
  const relatedColumnDef = relatedTable[relatedColumn as keyof typeof relatedTable] as FieldDefinition
  return columnValidation(relatedColumnDef, operator)
}

/**
 * The operator expects an array value.
 */
function expectsArrayValue(operator: Operator) {
  return ['$in', '$nin', '$between', '$nbetween'].includes(operator)
}

/**
 * The operator expects a boolean value.
 */
function expectsBooleanValue(operator: Operator) {
  return ['$null', '$nnull'].includes(operator)
}

interface ItemValidationOptions {
  optional?: boolean
  includePrimaryKey?: boolean
}
