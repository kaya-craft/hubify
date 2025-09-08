import type { QueryBuilder } from 'knex'
import type { Schema, TableRelations, TableNames, QueryParams, FieldName } from '../types'
import { OPERATORS } from '../operators'

/**
 * Get all query columns from the query parameters.
 */
export function getAllColumns<S extends Schema, T extends TableNames<S>>(query: QueryParams<S, T>) {
  const columns = new Set<string>([
    ...(query.columns || []),
    ...(query.orderBy?.map(c => c.replace(/^-/, '')) || []),
    ...(query.groupBy || []),
    ...(query.where
      ? Object.entries(query.where).flatMap(function _([key, value]): string[] {
          if (key === '$and' || key === '$or') {
            return value.flatMap(v => Object.entries(v).flatMap(_))
          }

          return [key]
        })
      : [])
  ])

  return Array.from(columns)
}

/**
 * Get the necessary joins from the query parameters.
 */
export function getJoinsFromQuery<S extends Schema, T extends TableNames<S>>(schema: S, table: T, query: QueryParams<S, T>) {
  const relations = schema[table]?.relations

  if (!relations) return []

  const joins = new Map<TableNames<S>, TableRelations<S, TableNames<S>>[string]>()

  getAllColumns(query).forEach((column) => {
    return column.split('.').reduce((acc, part) => {
      const relation = acc?.[part as keyof typeof acc] as TableRelations<S, TableNames<S>>[string] | undefined

      if (relation && 'table' in relation) {
        joins.set(relation.table, relation)
        return schema[relation.table]?.relations
      }

      return acc
    }, relations)
  })

  return joins
}

/**
 * Normalize columns in a query by returning their full path (table.column).
 */
export function normalizeColumns<S extends Schema, T extends TableNames<S>>(schema: S, table: T, columns: FieldName<S, T>[]) {
  return columns.map(column => normalizeColumn(schema, table, column))
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
      return '-' + normalizeColumn(schema, table, column.slice(1) as FieldName<S, T>)
    }
    return normalizeColumn(schema, table, column as FieldName<S, T>)
  })
}

/**
 * Build where query from condition tree.
 */
export function buildWhereQuery<S extends Schema, T extends TableNames<S>>(schema: S, table: T, where: QueryParams<S, T>['where']) {
  if (!where) return {}

  return (qb: QueryBuilder) => {
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
export function buildJoins<S extends Schema, T extends TableNames<S>>(schema: S, table: T, query: QueryParams<S, T>) {
  const joins = getJoinsFromQuery(schema, table, query)

  return (qb: QueryBuilder) => {
    joins.forEach((relation) => {
      if (relation.through) {
        const throughRelation = schema[relation.through]?.relations?.[relation.toKey] as TableRelations<S, TableNames<S>>[string]
        if (!throughRelation) throw new Error(`Through relation not found: ${relation.through}.${relation.toKey}`)
        qb.leftJoin(relation.through, `${throughRelation.table}.${relation.fromKey}`, '=', `${relation.through}.${relation.toKey}`)
        qb.leftJoin(relation.table, `${relation.through}.${relation.throughKey}`, '=', `${relation.table}.${relation.fromKey}`)
      }
      else {
        qb.leftJoin(relation.table, `${table}.${relation.fromKey}`, '=', `${relation.table}.${relation.toKey}`)
      }
    })
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
