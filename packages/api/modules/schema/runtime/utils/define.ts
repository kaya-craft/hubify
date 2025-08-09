import type { TableColumn as _TableColumn, TableRelation } from '@hubify/restql'
import type { Item } from '@hubify/restql/utils/helpers'

export function defineTableColumns<const C extends SchemaColumns>(columns: C): C {
  return columns
}

export function defineTableRelations<const R extends SchemaRelations>(relations: R): R {
  return relations
}

export type Schema = typeof import('#hubify/schema').default
export type SchemaColumns = Record<string, _TableColumn>
export type SchemaRelations = Record<string, TableRelation>
export type TableNames = keyof Schema
export type Table<T extends TableNames> = Schema[T]
export type TableColumnNames<T extends TableNames> = keyof Schema[T]['columns'] & string
export type TableColumns<T extends TableNames> = Schema[T]['columns']
export type TableColumn<T extends TableNames, C extends TableColumnNames<T>> = Schema[T]['columns'][C] extends infer U extends _TableColumn ? U : never
export type TableItem<T extends TableNames> = Item<Schema, T>
