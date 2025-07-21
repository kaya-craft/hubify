/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UnionToTuple } from 'type-fest'
import type { AllFields, Item, JoinClauses, Normalize, NormalizedColumns, OrderByClauses, SchemaDiff, WhereClauses, Wrap } from './helpers'
import type { CleanJoin } from '@/types/helpers'
import type { QueryParams } from '@/types/params'
import type { FieldName, Schema, Table, TableColumn, TableName, TableRelation } from '@/types/schema'
import { getAllJoinClauses, getOrderByClauses, getWhereClauses, join, normalizeColumns, normalizeOperationValue, wrap } from './helpers'

/**
 * SQL Select statement for the specified table and columns.
 */
export function select<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>[] | undefined>(schema: S, table: T, columns?: C): Select<S, T, C> {
  return `SELECT ${normalizeColumns(schema, table, columns)}`
}

/**
 * SQL Update statement for the specified table.
 */
export function update<T extends TableName<Schema>>(table: T): Update<T> {
  return `UPDATE ${wrap(table)}`
}

/**
 * SQL Remove statement for the specified table.
 */
export function remove<T extends TableName<Schema>>(table: T): Remove<T> {
  return `DELETE FROM ${wrap(table)}`
}

/**
 * SQL Insert statement for the specified table.
 */
export function insert<T extends TableName<Schema>>(table: T): Insert<T> {
  return `INSERT INTO ${wrap(table)}`
}

/**
 * SQL Create statement for the specified table.
 */
export function createTable<const N extends string, const T extends Table>(name: N, definition: T) {
  return join([
    `CREATE TABLE IF NOT EXISTS ${name} (`,
    join(Object.entries(definition.columns).map(([name, column]) => defineTableColumn(name, column, definition.relations?.[name])), ', '),
    ')'
  ], '') as CreateTable<N, T>
}

/**
 * SQL Column statement for the specified table and columns.
 */
function defineTableColumn<N extends string, C extends TableColumn>(name: N, column: C): DefineTableColumn<N, C>
function defineTableColumn<N extends string, C extends TableColumn, R extends TableRelation>(name: N, column: C, relation?: R): DefineTableColumn<N, C, R>
function defineTableColumn<N extends string, C extends TableColumn, R extends TableRelation | undefined>(name: N, column: C, relation?: R) {
  const constraints = [
    column.primaryKey ? 'PRIMARY KEY' : '',
    column.unique ? 'UNIQUE' : '',
    column.notNull ? 'NOT NULL' : '',
    typeof column.default !== 'undefined' ? `DEFAULT ${column.default}` : '',
    relation ? `REFERENCES ${relation.table}(${relation.toKey}) ON DELETE ${relation.onDelete || 'NO ACTION'} ON UPDATE ${relation.onUpdate || 'NO ACTION'}` : ''
  ].filter(Boolean).join(' ')

  return `${name} ${column.type.toUpperCase()} ${constraints}`.trim()
}

/**
 * SQL Alter statement for the specified table.
 */
export function updateTable<const N extends string, const D extends SchemaDiff['updated'][string]>(tableName: N, diff: D) {
  return join([
    ...Object.entries(diff.added || {}).map(([colName, def]) => addTableColumn(tableName, colName, def.column, def.relation)),
    ...Object.entries(diff.updated || {}).map(([colName, def]) => updateTableColumn(tableName, colName, def.column, def.relation)),
    ...Object.entries(diff.removed || {}).map(([colName]) => dropTableColumn(tableName, colName))
  ], '; ') as UpdateTable<N, D>
}

/**
 * SQL Add column statement for the specified table.
 */
export function addTableColumn<N extends string, C extends string, D extends TableColumn, R extends TableRelation>(table: N, colName: C, definition: D, relation?: R) {
  return `ALTER TABLE ${wrap(table)} ADD COLUMN ${defineTableColumn(colName, definition, relation)}` as AddTableColumn<N, C, R>
}

/**
 * SQL Update column statement for the specified table.
 */
export function updateTableColumn<N extends string, C extends string, D extends TableColumn, R extends TableRelation>(table: N, colName: C, definition: D, relation?: R) {
  return join([
    dropTableColumn(table, colName),
    `ALTER TABLE ${wrap(table)} ADD COLUMN ${defineTableColumn(colName, definition, relation)}`
  ], '; ') as UpdateTableColumn<N, C, D, R>
}

/**
 * SQL Drop column statement for the specified table.
 */
export function dropTableColumn<N extends string, C extends string>(table: N, colName: C): DropTableColumn<N, C> {
  return `ALTER TABLE ${wrap(table)} DROP COLUMN ${colName}`
}

/**
 * SQL Drop statement for the specified table.
 */
export function dropTable<N extends string>(table: N): DropTable<N> {
  return `DROP TABLE IF EXISTS ${wrap(table)}`
}

/**
 * SQL Values statement for the specified item.
 */
export function values<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>>(item: I): Values<S, T, I> {
  return `(${join(Object.keys(item), ', ')}) VALUES (${join(Object.values(item).map(normalizeOperationValue), ', ')})` as Values<S, T, I>
}

/**
 * SQL Set statement for the specified table and item.
 */
export function set<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>>(item: I): Set<S, T, I> {
  return `SET ${join(Object.entries(item).map(([key, value]) => `${wrap(key)} = ${normalizeOperationValue(value)}`), ', ')}` as Set<S, T, I>
}

/**
 * SQL From statement for the specified table.
 */
export function from<S extends Schema, T extends TableName<S>>(table: T): From<S, T> {
  return `FROM ${wrap(table)}`
}

/**
 * SQL Limit statement for the specified query parameters.
 */
export function limit<L extends QueryParams['limit']>(limit: L): Limit<L> {
  return (limit !== undefined ? `LIMIT ${limit}` : '') as Limit<L>
}

/**
 * SQL Offset statement for the specified query parameters.
 */
export function offset<O extends QueryParams['offset']>(offset: O): Offset<O> {
  return (offset !== undefined ? `OFFSET ${offset}` : '') as Offset<O>
}

/**
 * SQL Joins for the specified table and query parameters.
 */
export function joins<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>(schema: S, table: T, params: P): Joins<S, T, P> {
  return join(getAllJoinClauses(schema, table, params), ' ') as unknown as Joins<S, T, P>
}

/**
 * SQL Group By statement for the specified query parameters.
 */
export function groupBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['groupBy']>(schema: S, table: T, columns?: C): GroupBy<S, T, C> {
  return (!columns?.length ? '' : `GROUP BY ${normalizeColumns(schema, table, columns)}`) as GroupBy<S, T, C>
}

/**
 * Get order by clauses for the specified query parameters.
 */
export function orderBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['orderBy']>(schema: S, table: T, columns?: C): OrderBy<S, T, C> {
  return (!columns?.length ? '' : `ORDER BY ${getOrderByClauses(schema, table, columns)}`) as OrderBy<S, T, C>
}

/**
 * SQL Where statement for the specified query parameters.
 */
export function where<S extends Schema, T extends TableName<S>, W extends QueryParams<S, T>['where']>(schema: S, table: T, where: W): Where<S, T, W> {
  return (where ? `WHERE ${getWhereClauses(schema, table, where)}` : '') as Where<S, T, W>
}

export type Insert<T extends TableName<Schema>> = `INSERT INTO ${Wrap<T>}`

export type Select<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>[] | undefined> = `SELECT ${CleanJoin<NormalizedColumns<S, T, C>>}`

export type Update<T extends TableName<Schema>> = `UPDATE ${Wrap<T>}`

export type Remove<T extends TableName<Schema>> = `DELETE FROM ${Wrap<T>}`

export type Values<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>> = `(${CleanJoin<UnionToTuple<{ [K in keyof I]: Wrap<K & string> }[keyof I]>>}) VALUES (${CleanJoin<UnionToTuple<{ [K in keyof I]: Normalize<I[K]> }[keyof I]>, ', '>})`

export type Set<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>> = `SET ${CleanJoin<UnionToTuple<{ [K in keyof I]: `${Wrap<K & string>} = ${Normalize<I[K]>}` }[keyof I]>>}`

export type From<S extends Schema, T extends TableName<S>> = `FROM ${Wrap<T>}`

export type Limit<L extends QueryParams['limit']> = L extends number ? `LIMIT ${L}` : ''

export type Offset<O extends QueryParams['offset']> = O extends number ? `OFFSET ${O}` : ''

export type Joins<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>> = CleanJoin<JoinClauses<S, T, AllFields<S, T, P>[number]>, ' '>

export type GroupBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['groupBy']> = C extends string[]
  ? `GROUP BY ${CleanJoin<NormalizedColumns<S, T, C>>}` : ''

export type OrderBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['orderBy']> = C extends string[]
  ? `ORDER BY ${CleanJoin<OrderByClauses<S, T, C>>}` : ''

export type Where<S extends Schema, T extends TableName<S>, W extends QueryParams<S, T>['where']> = W extends Record<string, any> ? `WHERE ${WhereClauses<S, T, W>}` : ''

export type DropTable<N extends string> = `DROP TABLE IF EXISTS ${Wrap<N>}`

export type DropTableColumn<N extends string, C extends string> = `ALTER TABLE ${Wrap<N>} DROP COLUMN ${Wrap<C>}`

export type CreateTable<N extends string, T extends Table> = `CREATE TABLE IF NOT EXISTS ${Wrap<N>} (${CleanJoin<UnionToTuple<{
  [K in keyof T['columns']]: DefineTableColumn<K & string, T['columns'][K], K extends keyof T['relations'] ? T['relations'][K] extends infer R extends TableRelation ? R : undefined : undefined>
}[keyof T['columns']]>>})`

export type DefineTableColumn<N extends string, C extends TableColumn, R extends TableRelation | undefined = undefined> = `${Wrap<N>} ${Uppercase<C['type']>} ${CleanJoin<[
  C['primaryKey'] extends true ? 'PRIMARY KEY' : '',
  C['unique'] extends true ? 'UNIQUE' : '',
  C['notNull'] extends true ? 'NOT NULL' : '',
  C['default'] extends string | number | boolean ? `DEFAULT ${C['default']}` : '',
  R extends TableRelation ? `REFERENCES ${R['table']}(${R['toKey']}) ON DELETE ${R['onDelete'] extends string ? R['onDelete'] : 'NO ACTION'} ON UPDATE ${R['onUpdate'] extends string ? R['onUpdate'] : 'NO ACTION'}` : ''
], ' '>}`

export type UpdateTable<_N extends string, _D extends SchemaDiff['updated'][string]> = string

export type UpdateTableColumn<N extends string, C extends string, D extends TableColumn, R extends TableRelation> = CleanJoin<[
  DropTableColumn<N, C>,
  `ALTER TABLE ${Wrap<N>} ADD COLUMN ${DefineTableColumn<C, D, R>}`
], ';'>

export type AddTableColumn<N extends string, C extends string, R extends TableRelation | undefined = undefined> = `ALTER TABLE ${Wrap<N>} ADD COLUMN ${DefineTableColumn<C, TableColumn, R>}`
