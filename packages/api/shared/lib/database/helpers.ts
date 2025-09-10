import type { knex } from 'knex'
import type { Schema, TableNames, QueryParams, FieldName, RelationDefinition } from './types'
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
      const column = acc?.[part as keyof typeof acc]

      if (!isRelation(column)) return acc

      joins.set(part, column)

      return schema[column.table]?.columns
    }, schema[table]?.columns)
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
    const column = schema[table]?.columns?.[part]
    if (isRelation(column) && index < array.length - 1) {
      table = column.table as T
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

  for (const [fromKey, relation] of joins) {
    if (relation.type === 'many-to-many') {
      const [throughForeignKey, throughRelation] = Object.entries(schema[relation.through]?.columns ?? {}).find(([_, col]) => {
        return isRelation(col) && col.table === relation.table
      }) || []
      if (!isRelation(throughRelation)) throw new Error(`Through relation not found: ${relation.through} -> ${relation.table}`)
      const throughLocalKey = 'foreignKey' in relation ? relation.foreignKey : getPrimaryKeyColumn(schema, throughRelation.table)

      const throughRelation2 = schema[relation.through]?.columns?.[relation.throughKey]
      if (!isRelation(throughRelation2)) throw new Error(`Through relation not found: ${relation.through} -> ${relation.table}`)
      const relationLocalKey = 'foreignKey' in relation ? relation.foreignKey : getPrimaryKeyColumn(schema, throughRelation2.table)

      builder.leftJoin(relation.through, `${throughRelation2.table}.${relationLocalKey}`, '=', `${relation.through}.${relation.throughKey}`)
      builder.leftJoin(relation.table, `${relation.through}.${throughForeignKey}`, '=', `${throughRelation.table}.${throughLocalKey}`)
    }
    else {
      const foreignKey = 'foreignKey' in relation ? relation.foreignKey : getPrimaryKeyColumn(schema, relation.table)
      builder.leftJoin(relation.table, `${table}.${fromKey}`, '=', `${relation.table}.${foreignKey}`)
    }
  }
}

/**
 * Get the primary key column of a table.
 */
export function getPrimaryKeyColumn<S extends Schema, T extends TableNames<S>>(schema: S, table: T) {
  const columns = schema[table]?.columns
  if (!columns) throw new Error(`Table not found in schema: ${table}`)

  const primaryKeyColumn = Object.entries(columns).find(([_, col]) => 'primary' in col && col.primary)

  if (!primaryKeyColumn) throw new Error(`Primary key column not found for table: ${table}`)

  return primaryKeyColumn[0] as FieldName<S, T>
}

/**
 * Wrap the builder to return a single item instead of an array.
 */
export function wrapSingleResult<B extends knex.Knex.QueryBuilder>(builder: B) {
  const then = builder.then.bind(builder)

  builder.then = function (resolve, reject) {
    if (!resolve) return then(resolve, reject)
    return then(rows => resolve(rows[0]), reject)
  }

  return builder
}

/**
 * Check if a column definition is a relation.
 */
function isRelation(column: unknown): column is RelationDefinition {
  return typeof column === 'object' && column !== null && 'table' in column && 'type' in column && (column.type === 'one-to-one' || column.type === 'one-to-many' || column.type === 'many-to-one' || column.type === 'many-to-many')
}
