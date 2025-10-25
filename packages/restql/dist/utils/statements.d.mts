import { UnionToTuple } from 'type-fest';
import { S as Schema, a as TableName, F as FieldName, c as CleanJoin, N as NormalizedColumns, r as Wrap, T as Table, h as TableColumn, i as TableRelation, s as SchemaDiff, I as Item, t as Normalize, Q as QueryParams, u as JoinClauses, A as AllFields, v as OrderByClauses, w as WhereClauses } from '../shared/restql.BvbKE3f7.mjs';
import 'type-fest/source/union-to-tuple';
import 'type-fest/source/join';

/**
 * SQL Select statement for the specified table and columns.
 */
declare function select<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>[] | undefined>(schema: S, table: T, columns?: C): Select<S, T, C>;
/**
 * SQL Update statement for the specified table.
 */
declare function update<T extends TableName<Schema>>(table: T): Update<T>;
/**
 * SQL Remove statement for the specified table.
 */
declare function remove<T extends TableName<Schema>>(table: T): Remove<T>;
/**
 * SQL Insert statement for the specified table.
 */
declare function insert<T extends TableName<Schema>>(table: T): Insert<T>;
/**
 * SQL Create statement for the specified table.
 */
declare function createTable<const N extends string, const T extends Table>(name: N, definition: T): CreateTable<N, T>;
/**
 * SQL Alter statement for the specified table.
 */
declare function updateTable<const N extends string, const D extends SchemaDiff['updated'][string]>(tableName: N, diff: D): UpdateTable<N, D>;
/**
 * SQL Add column statement for the specified table.
 */
declare function addTableColumn<N extends string, C extends string, D extends TableColumn, R extends TableRelation>(table: N, colName: C, definition: D, relation?: R): AddTableColumn<N, C, R>;
/**
 * SQL Update column statement for the specified table.
 */
declare function updateTableColumn<N extends string, C extends string, D extends TableColumn, R extends TableRelation>(table: N, colName: C, definition: D, relation?: R): UpdateTableColumn<N, C, D, R>;
/**
 * SQL Drop column statement for the specified table.
 */
declare function dropTableColumn<N extends string, C extends string>(table: N, colName: C): DropTableColumn<N, C>;
/**
 * SQL Drop statement for the specified table.
 */
declare function dropTable<N extends string>(table: N): DropTable<N>;
/**
 * SQL Values statement for the specified item.
 */
declare function values<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>>(schema: S, table: T, item: I): Values<S, T, I>;
/**
 * SQL Set statement for the specified table and item.
 */
declare function set<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>>(schema: S, table: T, item: I): Set<S, T, I>;
/**
 * SQL From statement for the specified table.
 */
declare function from<S extends Schema, T extends TableName<S>>(table: T): From<S, T>;
/**
 * SQL Limit statement for the specified query parameters.
 */
declare function limit<L extends QueryParams['limit']>(limit: L): Limit<L>;
/**
 * SQL Offset statement for the specified query parameters.
 */
declare function offset<O extends QueryParams['offset']>(offset: O): Offset<O>;
/**
 * SQL Joins for the specified table and query parameters.
 */
declare function joins<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>>(schema: S, table: T, params: P): Joins<S, T, P>;
/**
 * SQL Group By statement for the specified query parameters.
 */
declare function groupBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['groupBy']>(schema: S, table: T, columns?: C): GroupBy<S, T, C>;
/**
 * Get order by clauses for the specified query parameters.
 */
declare function orderBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['orderBy']>(schema: S, table: T, columns?: C): OrderBy<S, T, C>;
/**
 * SQL Where statement for the specified query parameters.
 */
declare function where<S extends Schema, T extends TableName<S>, W extends QueryParams<S, T>['where']>(schema: S, table: T, where: W): Where<S, T, W>;
/**
 * SQL Returning statement for the specified columns.
 */
declare function returning<C extends unknown[]>(...columns: C): `RETURNING ${CleanJoin<C>}`;
type Returning<C extends unknown[]> = `RETURNING ${CleanJoin<C>}`;
type Insert<T extends TableName<Schema>> = `INSERT INTO ${Wrap<T>}`;
type Select<S extends Schema, T extends TableName<S>, C extends FieldName<S, T>[] | undefined> = `SELECT ${CleanJoin<NormalizedColumns<S, T, C>>}`;
type Update<T extends TableName<Schema>> = `UPDATE ${Wrap<T>}`;
type Remove<T extends TableName<Schema>> = `DELETE FROM ${Wrap<T>}`;
type Values<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>> = `(${CleanJoin<UnionToTuple<{
    [K in keyof I]: Wrap<K & string>;
}[keyof I]>>}) VALUES (${CleanJoin<UnionToTuple<{
    [K in keyof I]: Normalize<I[K]>;
}[keyof I]>, ', '>})`;
type Set<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>> = `SET ${CleanJoin<UnionToTuple<{
    [K in keyof I]: `${Wrap<K & string>} = ${Normalize<I[K]>}`;
}[keyof I]>>}`;
type From<S extends Schema, T extends TableName<S>> = `FROM ${Wrap<T>}`;
type Limit<L extends QueryParams['limit']> = L extends number ? `LIMIT ${L}` : '';
type Offset<O extends QueryParams['offset']> = O extends number ? `OFFSET ${O}` : '';
type Joins<S extends Schema, T extends TableName<S>, P extends QueryParams<S, T>> = CleanJoin<JoinClauses<S, T, AllFields<S, T, P>[number]>, ' '>;
type GroupBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['groupBy']> = C extends string[] ? `GROUP BY ${CleanJoin<NormalizedColumns<S, T, C>>}` : '';
type OrderBy<S extends Schema, T extends TableName<S>, C extends QueryParams<S, T>['orderBy']> = C extends string[] ? `ORDER BY ${CleanJoin<OrderByClauses<S, T, C>>}` : '';
type Where<S extends Schema, T extends TableName<S>, W extends QueryParams<S, T>['where']> = W extends Record<string, any> ? `WHERE ${WhereClauses<S, T, W>}` : '';
type DropTable<N extends string> = `DROP TABLE IF EXISTS ${Wrap<N>}`;
type DropTableColumn<N extends string, C extends string> = `ALTER TABLE ${Wrap<N>} DROP COLUMN ${Wrap<C>}`;
type CreateTable<N extends string, T extends Table> = `CREATE TABLE IF NOT EXISTS ${Wrap<N>} (${CleanJoin<UnionToTuple<{
    [K in keyof T['columns']]: DefineTableColumn<K & string, T['columns'][K], K extends keyof T['relations'] ? T['relations'][K] extends infer R extends TableRelation ? R : undefined : undefined>;
}[keyof T['columns']]>>})`;
type DefineTableColumn<N extends string, C extends TableColumn, R extends TableRelation | undefined = undefined> = `${Wrap<N>} ${Uppercase<C['type']>} ${CleanJoin<[
    C['primaryKey'] extends true ? 'PRIMARY KEY' : '',
    C['unique'] extends true ? 'UNIQUE' : '',
    C['notNull'] extends true ? 'NOT NULL' : '',
    C['default'] extends string | number | boolean ? `DEFAULT ${C['default']}` : '',
    R extends TableRelation ? `REFERENCES ${R['table']}(${R['toKey']}) ON DELETE ${R['onDelete'] extends string ? R['onDelete'] : 'NO ACTION'} ON UPDATE ${R['onUpdate'] extends string ? R['onUpdate'] : 'NO ACTION'}` : ''
], ' '>}`;
type UpdateTable<_N extends string, _D extends SchemaDiff['updated'][string]> = string;
type UpdateTableColumn<N extends string, C extends string, D extends TableColumn, R extends TableRelation> = CleanJoin<[
    DropTableColumn<N, C>,
    `ALTER TABLE ${Wrap<N>} ADD COLUMN ${DefineTableColumn<C, D, R>}`
], ';'>;
type AddTableColumn<N extends string, C extends string, R extends TableRelation | undefined = undefined> = `ALTER TABLE ${Wrap<N>} ADD COLUMN ${DefineTableColumn<C, TableColumn, R>}`;

export { addTableColumn, createTable, dropTable, dropTableColumn, from, groupBy, insert, joins, limit, offset, orderBy, remove, returning, select, set, update, updateTable, updateTableColumn, values, where };
export type { AddTableColumn, CreateTable, DefineTableColumn, DropTable, DropTableColumn, From, GroupBy, Insert, Joins, Limit, Offset, OrderBy, Remove, Returning, Select, Set, Update, UpdateTable, UpdateTableColumn, Values, Where };
