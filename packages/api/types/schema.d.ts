import type { TableNames as _TableNames, TableColumns as _TableColumns, TableColumnNames as _TableColumnNames, TableColumn as _TableColumn, TableRelations as _TableRelations, TableRelationNames as _TableRelationNames, TableRelation as _TableRelation, TableItem as _TableItem, QueryParams as _QueryParams, TableColumnType as _TableColumnType, TablePrimaryKeyValue as _TablePrimaryKeyValue, PrimaryKeyColumn, ConditionTree as _ConditionTree } from '@hubify/api/database/types.d'
import type { defineCollection as _defineCollection } from '#imports'

declare global {
  const defineCollection: typeof _defineCollection
}

export type Schema = typeof import('#hubify/schema').default
export type Table<T extends TableNames> = Schema[T]
export type TableNames = _TableNames<Schema> & string
export type TableColumns<T extends TableNames> = _TableColumns<Schema, T>
export type TableColumnNames<T extends TableNames> = _TableColumnNames<Schema, T>
export type TableColumn<T extends TableNames, C extends TableColumnNames<T>> = _TableColumn<Schema, T, C>
export type TableRelations<T extends TableNames> = _TableRelations<Schema, T>
export type TableRelationNames<T extends TableNames> = _TableRelationNames<Schema, T> & string
export type TableRelation<T extends TableNames, R extends TableRelationNames<T>> = Omit<_TableRelation<Schema, T, R>, 'table'> & { table: TableNames }
export type TableItem<T extends TableNames> = _TableItem<Schema, T>
export type QueryParams<T extends TableNames> = _QueryParams<T>
export type TableColumnType<T extends TableNames, C extends TableColumnNames<T>> = _TableColumnType<Schema, T, C>
export type TablePrimaryKey<T extends TableNames> = PrimaryKeyColumn<Schema, T>
export type TablePrimaryKeyValue<T extends TableNames> = _TablePrimaryKeyValue<Schema, T>

export type ConditionTree<T extends TableNames> = _ConditionTree<Schema, T>
