import type { Schema as _Schema, TableColumn as _TableColumn, PrimaryKey, TableRelation as _TableRelation } from '@hubify/restql'
import type { Item } from '@hubify/restql/utils/helpers'

export function defineTableColumns<const C extends SchemaColumns>(columns: C): C {
  return columns
}

export function defineTableRelations<const R extends SchemaRelations>(relations: R): R {
  return relations
}

export type Schema = typeof import('#hubify/schema').default
export type SchemaColumns = Record<string, _TableColumn>
export type TableNames = keyof Schema
export type Table<T extends TableNames> = Schema[T] & _Schema[string]
export type SchemaRelations = Record<string, Omit<_TableRelation, 'table'> & { table: TableNames }>

export type TableColumnNames<T extends TableNames> = keyof Schema[T]['columns'] & string
export type TableColumns<T extends TableNames> = Schema[T]['columns']
export type TableColumn<T extends TableNames, C extends TableColumnNames<T>> = Schema[T]['columns'][C] extends infer U extends _TableColumn ? U : never

export type TableRelations<T extends TableNames> = Schema[T] extends { relations: infer R }
  ? R extends SchemaRelations
    ? R & SchemaRelations
    : SchemaRelations
  : SchemaRelations
export type TableRelationNames<T extends TableNames> = keyof TableRelations<T>
export type TableRelation<T extends TableNames, R extends TableRelationNames<T>> = TableRelations<T>[R]

export type TableItem<T extends TableNames> = Item<Schema, T>
export type TablePrimaryKey<T extends TableNames> = Extract<PrimaryKey<Schema, T>, string | number>
export type TablePrimaryKeyValue<T extends TableNames> = Extract<TablePrimaryKey<T> extends keyof TableItem<T> ? TableItem<T>[TablePrimaryKey<T>] : never, string | number>
