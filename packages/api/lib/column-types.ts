import schema from '#hubify/schema'
import type { ColumnDefinition, DataTypes, Operator } from '@hubify/api/database/types.d'
import { OPERATORS } from './database/operators'
import z from 'zod'

const typesToZod = {
  int8: z.coerce.number().int(),
  int4: z.coerce.number().int(),
  numeric: z.coerce.number().int(),
  integer: z.coerce.number().int(),
  float4: z.coerce.number(),
  text: z.string(),
  varchar: z.string(),
  uuid: z.uuid(),
  timestamp: z.coerce.date(),
  date: z.coerce.date(),
  timestamptz: z.coerce.date(),
  boolean: z.coerce.boolean(),
  json: z.any(),
  datetime: z.coerce.date()
} satisfies Record<DataTypes, z.ZodTypeAny>

/**
 * Default field rules based on the column type.
 */
export function columnTypeToZod<T extends DataTypes>(type: T) {
  return typesToZod[type] ?? z.any()
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
    return z.array(columnTypeToZod(column.type))
  }

  return columnTypeToZod(column.type)
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
export function isOneToManyRelation<T extends TableNames, R extends TableColumnNames<T>>(table: T, relation: R) {
  return 'relations' in schema[table] && relation in schema[table].relations && (relation in schema[table].columns)
}

/**
 * Check if a column is a many-to-one relation.
 */
export function isManyToOneRelation<T extends TableNames, R extends TableColumnNames<T>>(table: T, relation: R) {
  return 'relations' in schema[table] && relation in schema[table].relations && !(relation in schema[table].columns)
}
