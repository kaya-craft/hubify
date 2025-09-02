/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Trim, UnionToTuple } from 'type-fest'
import type { JoinableItem } from 'type-fest/source/join'
import type { CleanJoin, Simplify, UniqueArray } from '@/types/helpers'
import type { Condition, ConditionTree, QueryParams } from '@/types/params'
import type { ColumnTypes, FieldName, PrimaryKey, PrimaryKeyValue, Relation, RelationDefinition, RelationName, RelationTableName, Schema, Table, TableColumn, TableDefinition, TableName, TableRelation } from '@/types/schema'

/**
 * SQL Operators.
 */
export const OPERATORS = {
  $eq: (value: unknown, type?: ColumnTypes) => `= ${normalizeOperationValue(value, type)}`,
  $neq: (value: unknown, type?: ColumnTypes) => `!= ${normalizeOperationValue(value, type)}`,
  $gt: (value: unknown, type?: ColumnTypes) => `> ${normalizeOperationValue(value, type)}`,
  $gte: (value: unknown, type?: ColumnTypes) => `>= ${normalizeOperationValue(value, type)}`,
  $lt: (value: unknown, type?: ColumnTypes) => `< ${normalizeOperationValue(value, type)}`,
  $lte: (value: unknown, type?: ColumnTypes) => `<= ${normalizeOperationValue(value, type)}`,
  $contains: (value: unknown) => `LIKE ${normalizeOperationValue('%' + value + '%')}`,
  $ncontains: (value: unknown) => `NOT LIKE ${normalizeOperationValue('%' + value + '%')}`,
  $startsWith: (value: unknown) => `LIKE ${normalizeOperationValue(value + '%')}`,
  $nstartsWith: (value: unknown) => `NOT LIKE ${normalizeOperationValue(value + '%')}`,
  $endsWith: (value: unknown) => `LIKE ${normalizeOperationValue('%' + value)}`,
  $nendsWith: (value: unknown) => `NOT LIKE ${normalizeOperationValue('%' + value)}`,
  $in: (value: unknown[], type?: ColumnTypes) => `IN (${join(value.map(value => normalizeOperationValue(value, type)), ', ')})`,
  $nin: (value: unknown[], type?: ColumnTypes) => `NOT IN (${join(value.map(value => normalizeOperationValue(value, type)), ', ')})`,
  $between: (value: unknown[], type?: ColumnTypes) => `BETWEEN ${normalizeOperationValue(value[0], type)} AND ${normalizeOperationValue(value[1], type)}`,
  $nbetween: (value: unknown[], type?: ColumnTypes) => `NOT BETWEEN ${normalizeOperationValue(value[0], type)} AND ${normalizeOperationValue(value[1], type)}`,
  $null: () => 'IS NULL',
  $nnull: () => 'IS NOT NULL'
}

/**
 * Get primaryKey
 */
export function getPrimaryKey<S extends Schema, T extends TableName<S>>(schema: S, table: T) {
  return Object.entries(schema[table].columns).find(([_, v]) => v.primaryKey)?.[0] as PrimaryKey<S, T> | undefined
}

/**
 * Add a primary key condition to the where clause.
 */
export function addPrimaryKeyCondition<S extends Schema, T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends QueryParams<S, T>>(schema: S, table: T, key: K, params: P = {} as P) {
  const primaryKey = getPrimaryKey(schema, table)

  if (!primaryKey) throw new Error(`Primary key not found for table ${table}`)

  params.where ??= {}

  Object.assign(params.where, { [primaryKey]: { $eq: key } })

  return params.where as WhereWithPrimaryKey<S, T, K, P>
}

/**
 * Wraps a string in backticks to be used as an identifier in SQL queries.
 */
export function wrap<T extends string>(value: T) {
  return value
}

/**
 * Unique array type that ensures all elements are unique.
 */
export function unique<T extends unknown[]>(arr: T) {
  return [...new Set(arr)] as UniqueArray<T>
}

/**
 * Join a list of strings with a separator.
 */
export function join<const T extends JoinableItem[], S extends string>(arr: T, separator: S = ', ' as S) {
  return arr.join(separator) as CleanJoin<T, S>
}

/**
 * Trim whitespace from the start and end of a string.
 */
export function trim<T extends string>(value: T) {
  return value.trim() as Trim<T>
}

/**
 * Prepends a string with another string.
 */
export function prepend<T extends string, P extends string>(value: T, prefix: P) {
  return `${prefix}${value}` as Prepend<T, P>
}

/**
 * Unprepend a string from another string.
 */
export function unprepend<T extends string, P extends string>(value: T, prefix: P) {
  return (value.startsWith(prefix) ? value.slice(prefix.length) : value) as Unprepend<T, P>
}

/**
 * Normalizes a column name to ensure it is properly formatted for SQL queries.
 */
export function normalizeColumn<S extends Schema, T extends TableName<S>, const C extends string>(schema: S, table: T, col: C) {
  return col.split('.').reduce((_, part, index, array) => {
    if (schema[table]?.relations?.[part] && index < array.length - 1) {
      table = schema[table].relations?.[part].table as T
    }
    return `${wrap(table)}.${wrap(part)}`
  }, '') as NormalizedColumn<S, T, C>
}

/**
 * Adds column modifier based on type.
 */
export function addColumnModifier<C extends string>(column: C, type?: ColumnTypes) {
  if (type === 'date' || type === 'timestamp' || type === 'timestamptz') {
    return `DATE(${column})` as const
  }

  return column
}

/**
 * Normalizes a list of columns for SQL queries.
 */
export function normalizeColumns<S extends Schema, T extends TableName<S>, F extends string[] | undefined>(schema: S, table: T, columns?: F) {
  return join(columns?.map(col => normalizeColumn(schema, table, col)) ?? ['*']) as unknown as CleanJoin<NormalizedColumns<S, T, F>, ', '>
}

/**
 * Get relation information for a column in the specified schema and table.
 */
export function getRelationInfo<S extends Schema, T extends TableName<S>, C extends string>(schema: S, table: T, col: C) {
  const parts = col.split('.')
  const relationInfo = [] as Relation<S, T, C>

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const info = relationInfo[relationInfo.length - 1]
    const fromTable = info?.toTable ?? table
    const relation = schema[fromTable]?.relations?.[part]
    if (!relation) break
    relationInfo.push({
      fromTable,
      fromKey: relation.fromKey,
      toTable: relation.table,
      toKey: relation.toKey
    } as never)
  }

  return relationInfo
}

/**
 * Get join clauses for the specified query.
 */
export function getJoinClause<R extends Relation<any, any, any>[number]>(relation: R) {
  const toTable = relation.toTable as R['toTable']
  const fromTable = relation.fromTable as R['fromTable']
  const fromKey = relation.fromKey as R['fromKey']
  const toKey = relation.toKey as R['toKey']
  return `INNER JOIN ${wrap(toTable)} ON ${wrap(toTable)}.${wrap(toKey)} = ${wrap(fromTable)}.${wrap(fromKey)}` as const
}

/**
 * Get join clauses for the specified query.
 */
export function getJoinClauses<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>>(schema: S, table: T, col: C) {
  const info = getRelationInfo(schema, table, col)

  if (!info) return '' as const

  return unique(info.map(getJoinClause)) as JoinClauses<S, T, C>
}

/**
 * Get all unique fields.
 */
export function getAllFields<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>(_schema: S, _table: T, params: P): AllFields<S, T, P> {
  return unique([
    ...(params.columns ?? []),
    ...(params.groupBy ?? []),
    ...(params.orderBy ?? []).map(col => unprepend(col, '-'))
  ]) as AllFields<S, T, P>
}

/**
 * Get all joins for the specified query.
 */
export function getAllJoinClauses<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>(schema: S, table: T, params: P) {
  const fields = getAllFields(schema, table, params)

  return unique(fields.flatMap(col => getJoinClauses(schema, table, col))) as unknown as JoinClauses<S, T, AllFields<S, T, P>[number]>
}

/**
 * Get order by clauses for the specified query.
 */
export function getOrderByClauses<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['orderBy']>(schema: S, table: T, columns?: C) {
  if (!columns?.length) return '' as const

  return columns.map((col) => {
    const normalizedCol = normalizeColumn(schema, table, col)
    return col.startsWith('-') ? `${normalizedCol} DESC` : `${normalizedCol} ASC`
  }) as OrderByClauses<S, T, C>
}

/**
 * Get where clause.
 */
export function getWhereClauses<S extends Schema, T extends TableName<S>, const C extends Condition | ConditionTree<S, T>>(schema: S, table: T, condition: C): WhereClauses<S, T, C> {
  return join(Object.entries(condition).flatMap(([key, value]) => {
    if (key === '$and' && Array.isArray(value)) {
      return `(${join(value.flatMap(v => getWhereClauses(schema, table, v)), ' AND ')})`
    }
    else if (key === '$or' && Array.isArray(value)) {
      return `(${join(value.flatMap(v => getWhereClauses(schema, table, v)), ' OR ')})`
    }
    else if (!Array.isArray(value) && typeof value === 'object') {
      const column = normalizeColumn(schema, table, key)
      const type = schema[table]?.columns?.[key]?.type as ColumnTypes
      return Object.entries(value).flatMap(([operator, val]) => {
        if (operator in OPERATORS) {
          const fn = OPERATORS[operator as keyof typeof OPERATORS]
          return `${addColumnModifier(column, type)} ${fn(val as unknown[], type)}`
        }
        return getWhereClauses(schema, table, { [operator]: val })
      })
    }

    return []
  }), ' AND ') as WhereClauses<S, T, C>
}

/**
 * Stringify operator value if necessary
 */
export function normalizeOperationValue<V>(value: V, type?: ColumnTypes): Normalize<V> {
  if (type === 'numeric' || type === 'float4' || type === 'int4' || type === 'integer' || type === 'int8' || type === 'boolean') {
    return value as Normalize<V>
  }

  return `'${value}'` as Normalize<V>
}

/**
 * Create a diff between two schemas.
 */
export function getSchemaDiff(current: Schema, newSchema: Schema) {
  const diff: SchemaDiff = {
    added: {},
    updated: {},
    removed: {}
  }

  for (const tableName in newSchema) {
    if (current[tableName]) {
      const { columns: columns1, relations: relations1 } = current[tableName]
      const { columns: columns2, relations: relations2 } = newSchema[tableName]

      for (const name in columns2) {
        if (name in columns1) {
          if (columnHasChanged(columns1[name], columns2[name], relations1?.[name], relations2?.[name])) {
            diff.updated[tableName] ??= {}
            diff.updated[tableName].updated ??= {}
            diff.updated[tableName].updated[name] = {
              column: columns2[name],
              relation: relations2?.[name]
            }
          }
        }
        else {
          diff.updated[tableName] ??= {}
          diff.updated[tableName].added ??= {}
          diff.updated[tableName].added[name] = {
            column: columns2[name],
            relation: relations2?.[name]
          }
        }
      }

      for (const name in columns1) {
        if (name in columns2) continue
        diff.updated[tableName] ??= {}
        diff.updated[tableName].removed ??= {}
        diff.updated[tableName].removed[name] = true
      }
    }
    else {
      diff.added[tableName] = newSchema[tableName]
    }
  }

  for (const tableName in current) {
    if (newSchema[tableName]) continue
    diff.removed[tableName] = true
  }

  return diff
}

/**
 * CHeck if column definition has changed in any way.
 */
function columnHasChanged(column1: TableColumn, column2: TableColumn, relations1?: TableRelation, relations2?: TableRelation) {
  return (
    column1.type?.toLowerCase() !== column2.type?.toLowerCase()
    || Boolean(column1.primaryKey) !== Boolean(column2.primaryKey)
    || Boolean(column1.unique) !== Boolean(column2.unique)
    || Boolean(column1.notNull) !== Boolean(column2.notNull)
    || column1.default?.toString() !== column2.default?.toString()
    || relations1?.table !== relations2?.table
    || relations1?.fromKey !== relations2?.fromKey
    || relations1?.toKey !== relations2?.toKey
    || relations1?.onDelete !== relations2?.onDelete
    || relations1?.onUpdate !== relations2?.onUpdate
  )
}

export interface SchemaDiff {
  added: Record<string, Table>
  removed: Record<string, true>
  updated: Record<string, {
    added?: Record<string, { column: TableColumn, relation?: TableRelation }>
    removed?: Record<string, true>
    updated?: Record<string, { column: TableColumn, relation?: TableRelation }>
  }>
}
export type NormalizedColumn<S extends Schema, T extends TableName<S>, C extends string>
    = C extends '*' ? `${Wrap<T>}.${C}`
      : C extends `${infer K}.${infer V}` ? K extends keyof S[T]['relations']
        ? S[T]['relations'][K] extends { table: infer R }
          ? R extends string ? NormalizedColumn<S, R, V> : never
          : never
        : never
        : `${Wrap<T>}.${Wrap<C>}`

export type NormalizedColumns<S extends Schema, T extends TableName<S>, F extends string[] | undefined, Wildcard extends boolean = true>
    = F extends string[]
      ? UnionToTuple<NormalizedColumn<S, T, F[number]>>
      : Wildcard extends true
        ? [NormalizedColumn<S, T, '*'>]
        : []

export type Wrap<T extends string> = ReturnType<typeof wrap<T>>

export type Unprepend<T extends string, P extends string> = T extends `${P}${infer R}` ? R : T

export type Prepend<T extends string, P extends string> = `${P}${T}`

export type JoinClauses<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>> = UniqueArray<UnionToTuple<
    Relation<S, T, C> extends (infer U)[]
      ? U extends RelationDefinition<any, any, any>
        ? ReturnType<typeof getJoinClause<U>>
        : never
      : never
>>

export type OrderByClause<S extends Schema, T extends TableName<S>, C extends string> = C extends `-${infer K}` ? `${NormalizedColumn<S, T, K>} DESC` : `${NormalizedColumn<S, T, C>} ASC`

export type OrderByClauses<S extends Schema, T extends TableName<S>, C extends string[] | undefined> = UniqueArray<UnionToTuple<
    C extends (infer U)[] ? U extends string ? OrderByClause<S, T, U> : never : never
>>

export type Normalize<T>
    = T extends string ? `'${T}'`
      : T extends number | bigint | boolean | null | undefined ? `${T}`
        : never

export type NormalizeArray<T extends unknown[]> = T extends [infer U, ...infer Last] ? [Normalize<U>, ...NormalizeArray<Last>] : []

export type OperatorToSQL<O extends keyof typeof OPERATORS, V>
    = O extends '$eq' ? `= ${Normalize<V>}`
      : O extends '$neq' ? `!= ${Normalize<V>}`
        : O extends '$gt' ? `> ${Normalize<V>}`
          : O extends '$gte' ? `>= ${Normalize<V>}`
            : O extends '$lt' ? `< ${Normalize<V>}`
              : O extends '$lte' ? `<= ${Normalize<V>}`
                : O extends '$contains' ? `LIKE %${Normalize<V>}%`
                  : O extends '$ncontains' ? `NOT LIKE %${Normalize<V>}%`
                    : O extends '$startsWith' ? `LIKE ${Normalize<V>}%`
                      : O extends '$nstartsWith' ? `NOT LIKE ${Normalize<V>}%`
                        : O extends '$endsWith' ? `LIKE %${Normalize<V>}`
                          : O extends '$nendsWith' ? `NOT LIKE %${Normalize<V>}`
                            : O extends '$null' ? 'IS NULL'
                              : O extends '$nnull' ? 'IS NOT NULL'
                                : O extends '$in' ? V extends any[] ? `IN (${CleanJoin<NormalizeArray<V>>})` : never
                                  : O extends '$nin' ? V extends any[] ? `NOT IN (${CleanJoin<NormalizeArray<V>>})` : never
                                    : O extends '$between' ? V extends any[] ? `BETWEEN ${Normalize<V[0]>} AND ${Normalize<V[1]>}` : never
                                      : O extends '$nbetween' ? V extends any[] ? `NOT BETWEEN ${Normalize<V[0]>} AND ${Normalize<V[1]>}` : never
                                        : never

export type WhereColumnClause<F extends string, C extends Condition>
    = CleanJoin<UnionToTuple<{
      [CC in keyof C]: CC extends keyof typeof OPERATORS ? `${F} ${OperatorToSQL<CC, C[CC]>}` : never
    }[keyof C]> extends infer U extends JoinableItem[] ? U : never, ' AND '>

export type WhereClauses<S extends Schema, T extends TableName<S>, C extends Condition | ConditionTree<S, T>, F extends string = '', W extends string = ''>
    = C extends Condition
      ? WhereColumnClause<F, C>
      : C extends Record<string, any>
        ? CleanJoin<[
          W,
          ...UnionToTuple<{
            [K in keyof C]:
            K extends '$and'
              ? `(${CleanJoin<[W, ...UnionToTuple<WhereClauses<S, T, C['$and'][number], F>>], ' AND '>})`
              : K extends '$or'
                ? `(${CleanJoin<[W, ...UnionToTuple<WhereClauses<S, T, C['$or'][number], F>>], ' OR '>})`
                : K extends string
                  ? WhereClauses<S, T, C[K], NormalizedColumn<S, T, K>>
                  : never
          }[keyof C]>
        ], ' AND '>
        : W

type _Item<S extends Schema, T extends TableName<S>, C extends string[], I = {}> = C extends [infer U, ...infer Rest] ? I & {
  [K in U as U extends `${infer A}.${string}` ? A : U extends string ? U : never]:
  U extends string
    ? U extends `${infer A}.${infer B}`
      ? A extends RelationName<S, T>
        ? _Item<S, RelationTableName<S, T, A>, [B]>
        : never
      : U extends keyof TableDefinition<S, T>
        ? TableDefinition<S, T>[U]
        : never
    : never
} & (Rest extends string[] ? _Item<S, T, Rest> : {})
  : I

export type Item<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['columns'] | undefined = undefined> = C extends string[] ? Simplify<_Item<S, T, C>> : TableDefinition<S, T, false>

export type WhereWithPrimaryKey<S extends Schema, T extends TableName<S>, K extends PrimaryKeyValue<S, T>, P extends QueryParams<S, T>>
   = P['where'] & Record<PrimaryKey<S, T>, { $eq: K }>

export type AllFields<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>
    = UniqueArray<UnionToTuple<
        (P['columns'] extends string[] ? P['columns'][number] : never)
        | (P['groupBy'] extends string[] ? P['groupBy'][number] : never)
        | (P['orderBy'] extends string[] ? Unprepend<P['orderBy'][number], '-'> : never)
    >>
