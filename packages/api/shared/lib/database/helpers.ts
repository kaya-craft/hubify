import type { knex } from 'knex'
import type { Schema, TableNames, QueryParams, FieldName, RelationDefinition } from './types'
import { OPERATORS } from './operators'

/**
 * Get all query fields from the query parameters.
 */
export function getQueriedfields<S extends Schema, T extends TableNames<S>>(query: QueryParams<S, T>) {
  const fields = new Set<string>([
    ...getFieldsFields(query.fields),
    ...getOrderByfields(query.orderBy),
    ...getGroupByfields(query.groupBy),
    ...getWherefields(query.where)
  ])

  return Array.from(fields)
}

/**
 * Get the fields used in the where query.
 */
function getWherefields<S extends Schema, T extends TableNames<S>>(where: QueryParams<S, T>['where']): string[] {
  if (!where) return []

  return Object.entries(where).flatMap(([key, value]) => {
    if (key === '$and' || key === '$or') {
      if (Array.isArray(value)) return value.flatMap(getWherefields)
      return []
    }

    return [key]
  })
}

/**
 * Get the fields used in groupBy query.
 */
function getGroupByfields<S extends Schema, T extends TableNames<S>>(groupBy: QueryParams<S, T>['groupBy']) {
  if (!groupBy) return []

  return groupBy
}

/**
 * Get the fields used in fields query.
 */
function getFieldsFields<S extends Schema, T extends TableNames<S>>(fields: QueryParams<S, T>['fields']) {
  if (!fields) return []

  return fields
}

/**
 * Get the fields used in orderBy query.
 */
function getOrderByfields<S extends Schema, T extends TableNames<S>>(orderBy: QueryParams<S, T>['orderBy']) {
  if (!orderBy) return []

  return orderBy.map(field => field.replace(/^-/, ''))
}

/**
 * Get the necessary joins from the query parameters.
 */
export function getJoinsFromQuery<S extends Schema, T extends TableNames<S>>(schema: S, table: T, query: QueryParams<S, T>) {
  const joins = new Map<string, RelationDefinition>()

  const fields = getQueriedfields(query)

  for (const field of fields) {
    field.split('.').reduce((acc, part) => {
      const field = acc?.[part as keyof typeof acc]

      if (!isRelation(field)) return acc

      joins.set(part, field)

      return schema[field.table]?.fields
    }, schema[table]?.fields)
  }

  return joins
}

/**
 * Normalize fields in a query by returning their full path (table.field).
 */
export function normalizeFields<S extends Schema, T extends TableNames<S>>(schema: S, table: T, fields: FieldName<S, T>[]) {
  return fields?.map(field => normalizeField(schema, table, field))
}

/**
 * Normalize a field in a query by returning its full path (table.field).
 */
export function normalizeField<S extends Schema, T extends TableNames<S>>(schema: S, table: T, field: FieldName<S, T>): string {
  return field.split('.').reduce((_, part, index, array) => {
    const field = schema[table]?.fields?.[part]
    if (isRelation(field) && index < array.length - 1) {
      table = field.table as T
    }
    return table + '.' + part
  }, '')
}

/**
 * Normalize orderBy fields in a query by returning their full path (table.field).
 */
export function normalizeOrderBy<S extends Schema, T extends TableNames<S>>(schema: S, table: T, fields: `${'' | '-'}${FieldName<S, T>}`[]) {
  return fields.map((field) => {
    if (field.startsWith('-')) {
      return [normalizeField(schema, table, field.slice(1) as FieldName<S, T>), 'desc'] as const
    }
    return [normalizeField(schema, table, field as FieldName<S, T>), 'asc'] as const
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
        const field = normalizeField(schema, table, key as FieldName<S, T>)

        Object.entries(value).forEach(([op, val]) => {
          if (!(op in OPERATORS)) throw new Error(`Unsupported operator: ${op}`)

          const operator = OPERATORS[op as keyof typeof OPERATORS]
          return operator(qb, field, val)
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
      const [throughForeignKey, throughRelation] = Object.entries(schema[relation.through]?.fields ?? {}).find(([_, col]) => {
        return isRelation(col) && col.table === relation.table
      }) || []
      if (!isRelation(throughRelation)) throw new Error(`Through relation not found: ${relation.through} -> ${relation.table}`)
      const throughLocalKey = 'foreignKey' in relation ? relation.foreignKey : getPrimaryKeyColumn(schema, throughRelation.table)

      const throughRelation2 = schema[relation.through]?.fields?.[relation.throughKey]
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
 * Get the primary key field of a table.
 */
export function getPrimaryKeyColumn<S extends Schema, T extends TableNames<S>>(schema: S, table: T) {
  const fields = schema[table]?.fields
  if (!fields) throw new Error(`Table not found in schema: ${table}`)

  const primaryKeyColumn = Object.entries(fields).find(([_, col]) => 'primary' in col && col.primary)

  if (!primaryKeyColumn) throw new Error(`Primary key field not found for table: ${table}`)

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
 * Check if a field definition is a relation.
 */
function isRelation(field: unknown): field is RelationDefinition {
  return typeof field === 'object' && field !== null && 'table' in field && 'type' in field && (field.type === 'one-to-one' || field.type === 'one-to-many' || field.type === 'many-to-one' || field.type === 'many-to-many')
}
