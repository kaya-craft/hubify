import schema from '#hubify/schema'
import type { ColumnDefinition, Operator } from '@hubify/api/types/database'
import { OPERATORS } from '@hubify/api/modules/schema/utils/database/operators'
import z from 'zod'

/**
 * Default field rules based on the column type.
 */
export function columnTypeToZod(column: ColumnDefinition) {
  switch (column.type) {
    case 'int8':
    case 'int4':
    case 'numeric':
    case 'integer':
      return z.coerce.number().int()
    case 'float4':
      return z.coerce.number()
    case 'text':
    case 'varchar':
      return z.string()
    case 'uuid':
      return z.uuid()
    case 'timestamp':
    case 'date':
    case 'timestamptz':
      return z.coerce.date()
    case 'boolean':
      return z.coerce.boolean()
    case 'json':
    default:
      return z.any() // Fallback for unsupported types
  }
}

/**
 * Operators that can be applied to different column types.
 */
export function columnTypeToOperators(column: ColumnDefinition): Operator[] {
  const values = Object.keys(OPERATORS) as Operator[]

  switch (column.type) {
    case 'int8':
    case 'int4':
    case 'numeric':
    case 'integer':
    case 'float4':
      return ['$eq', '$neq', '$in', '$nin', '$lt', '$lte', '$gt', '$gte', '$nbetween', '$between', '$null', '$nnull']
    case 'text':
    case 'varchar':
      return ['$eq', '$neq', '$in', '$nin', '$startsWith', '$nstartsWith', '$endsWith', '$nendsWith', '$contains', '$ncontains', '$null', '$nnull']
    case 'uuid':
      return ['$eq', '$neq', '$in', '$nin', '$null', '$nnull']
    case 'timestamp':
    case 'timestamptz':
    case 'date':
      return ['$eq', '$neq', '$in', '$nin', '$lt', '$lte', '$gt', '$gte', '$nbetween', '$between', '$null', '$nnull']
    case 'boolean':
      return ['$eq', '$neq', '$null', '$nnull']
    case 'json':
    default:
      return values
  }
}

/**
 * Column validation type.
 */
export function columnValidation(column: ColumnDefinition, operator: Operator) {
  if (expectsBooleanValue(operator)) {
    return z.boolean()
  }

  if (expectsArrayValue(operator)) {
    return z.array(columnTypeToZod(column))
  }

  return columnTypeToZod(column)
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

/**
 * Check if a column is a one-to-many relation.
 */
export function isOneToManyRelation<T extends TableNames, R extends TableRelationNames<T>>(table: T, relation: R) {
  return 'relations' in schema[table] && relation in schema[table].relations && (relation in schema[table].columns)
}

/**
 * Check if a column is a many-to-one relation.
 */
export function isManyToOneRelation<T extends TableNames, R extends TableRelationNames<T>>(table: T, relation: R) {
  return 'relations' in schema[table] && relation in schema[table].relations && !(relation in schema[table].columns)
}
