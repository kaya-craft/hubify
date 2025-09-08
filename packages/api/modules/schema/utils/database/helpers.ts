import type { knex } from 'knex'
import type { Schema, TableNames, QueryParams, FieldName, RelationDefinition } from '@hubify/api/types/database'
import { OPERATORS } from './operators'

/**
 * Get all query columns from the query parameters.
 */
export function getQueriedColumns<S extends Schema, T extends TableNames<S>>(query: QueryParams<S, T>) {
  const columns = new Set<string>([
    ...getColumnsColumns(query.columns),
    ...getOrderByColumns(query.orderBy),
    ...getGroupByColumns(query.groupBy),
    ...getWhereColumns(query.where)
  ])

  return Array.from(columns)
}

/**
 * Get the columns used in the where query.
 */
function getWhereColumns(where: QueryParams['where']): string[] {
  if (!where) return []

  return Object.entries(where).flatMap(([key, value]) => {
    if (key === '$and' || key === '$or') {
      if (Array.isArray(value)) return value.flatMap(getWhereColumns)
      return []
    }

    return [key]
  })
}

/**
 * Get the columns used in groupBy query.
 */
function getGroupByColumns(groupBy: QueryParams['groupBy']) {
  if (!groupBy) return []

  return groupBy
}

/**
 * Get the columns used in columns query.
 */
function getColumnsColumns(columns: QueryParams['columns']) {
  if (!columns) return []

  return columns
}

/**
 * Get the columns used in orderBy query.
 */
function getOrderByColumns(orderBy: QueryParams['orderBy']) {
  if (!orderBy) return []

  return orderBy.map(column => column.replace(/^-/, ''))
}

/**
 * Get the necessary joins from the query parameters.
 */
export function getJoinsFromQuery<S extends Schema, T extends TableNames<S>>(schema: S, table: T, query: QueryParams<S, T>) {
  const joins = new Map<string, RelationDefinition>()

  const columns = getQueriedColumns(query)

  for (const column of columns) {
    column.split('.').reduce((acc, part) => {
      const relation = acc?.[part as keyof typeof acc] as RelationDefinition | undefined

      if (!relation) return acc

      joins.set(relation.table, relation)

      return schema[relation.table]?.relations
    }, schema[table]?.relations)
  }

  return joins
}

/**
 * Normalize columns in a query by returning their full path (table.column).
 */
export function normalizeColumns<S extends Schema, T extends TableNames<S>>(schema: S, table: T, columns: FieldName<S, T>[]) {
  return columns?.map(column => normalizeColumn(schema, table, column))
}

/**
 * Normalize a column in a query by returning its full path (table.column).
 */
export function normalizeColumn<S extends Schema, T extends TableNames<S>>(schema: S, table: T, column: FieldName<S, T>): string {
  return column.split('.').reduce((_, part, index, array) => {
    if (schema[table]?.relations?.[part] && index < array.length - 1) {
      table = schema[table]?.relations?.[part]?.table as T
    }
    return table + '.' + part
  }, '')
}

/**
 * Normalize orderBy columns in a query by returning their full path (table.column).
 */
export function normalizeOrderBy<S extends Schema, T extends TableNames<S>>(schema: S, table: T, columns: `${'' | '-'}${FieldName<S, T>}`[]) {
  return columns.map((column) => {
    if (column.startsWith('-')) {
      return [normalizeColumn(schema, table, column.slice(1) as FieldName<S, T>), 'desc'] as const
    }
    return [normalizeColumn(schema, table, column as FieldName<S, T>), 'asc'] as const
  })
}

/**
 * Build where query from condition tree.
 */
export function buildWhereQuery<S extends Schema, T extends TableNames<S>>(schema: S, table: T, where: QueryParams<S, T>['where']) {
  if (!where) return {}

  return (qb: knex.Knex.QueryBuilder) => {
    Object.entries(where).forEach(([key, value]) => {
      if (key === '$and' && Array.isArray(value) && value.length > 0) {
        qb.andWhere((qb) => {
          value.forEach((condition) => {
            qb.andWhere(buildWhereQuery(schema, table, condition))
          })
        })
      }
      else if (key === '$or' && Array.isArray(value) && value.length > 0) {
        qb.andWhere((qb) => {
          value.forEach((condition) => {
            qb.orWhere(buildWhereQuery(schema, table, condition))
          })
        })
      }
      else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const column = normalizeColumn(schema, table, key as FieldName<S, T>)

        Object.entries(value).forEach(([op, val]) => {
          if (!(op in OPERATORS)) throw new Error(`Unsupported operator: ${op}`)

          const operator = OPERATORS[op as keyof typeof OPERATORS]
          return operator(qb, column, val)
        })
      }
    })
  }
}

/**
 * Build necessary joins from the query parameters.
 */
export function addJoinQueries<S extends Schema, T extends TableNames<S>>(schema: S, table: T, query: QueryParams<S, T>, builder: knex.Knex.QueryBuilder) {
  const joins = getJoinsFromQuery(schema, table, query)

  if (!joins.size) return

  for (const [_, relation] of joins) {
    if (relation.through) {
      const throughRelation = schema[relation.through]?.relations?.[relation.toKey] as RelationDefinition | undefined
      if (!throughRelation) throw new Error(`Through relation not found: ${relation.through}.${relation.toKey}`)
      builder.leftJoin(relation.through, `${throughRelation.table}.${relation.fromKey}`, '=', `${relation.through}.${relation.toKey}`)
      builder.leftJoin(relation.table, `${relation.through}.${relation.throughKey}`, '=', `${relation.table}.${relation.fromKey}`)
    }
    else {
      builder.leftJoin(relation.table, `${table}.${relation.fromKey}`, '=', `${relation.table}.${relation.toKey}`)
    }
  }
}

/**
 * Get the primary key column of a table.
 */
export function getPrimaryKeyColumn<S extends Schema, T extends TableNames<S>>(schema: S, table: T) {
  const columns = schema[table]?.columns
  if (!columns) throw new Error(`Table not found in schema: ${table}`)

  const primaryKeyColumn = Object.entries(columns).find(([_, col]) => col.primaryKey)

  if (!primaryKeyColumn) throw new Error(`Primary key column not found for table: ${table}`)

  return primaryKeyColumn[0] as FieldName<S, T>
}
