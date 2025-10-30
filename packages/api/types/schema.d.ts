import type { TableNames as _TableNames, TableColumns as _TableColumns, TableColumnNames as _TableColumnNames, TableColumn as _TableColumn, TableRelations as _TableRelations, TableRelationNames as _TableRelationNames, TableRelation as _TableRelation, TableItem as _TableItem, QueryParams as _QueryParams, TableColumnType as _TableColumnType, TablePrimaryKeyValue as _TablePrimaryKeyValue, PrimaryKeyColumn, ConditionTree as _ConditionTree, ColumnDefinition, Prettify, Schema as _Schema, TableFieldNames as _TableFieldNames, TableFields as _TableFields } from '@hubify/api/database/types.d'

export type Schema = import('#hubify/schema').HubifySchema extends infer S extends _Schema ? S : never
export type Table<T extends TableNames> = Schema[T]
export type TableNames = _TableNames<Schema>
export type TableColumns<T extends TableNames> = _TableColumns<Schema, T>
export type TableColumnNames<T extends TableNames> = _TableColumnNames<Schema, T>
export type TableColumn<T extends TableNames, C extends TableColumnNames<T>> = TableColumns<T>[C] extends infer U extends ColumnDefinition ? U : never
export type TableFieldNames<T extends TableNames> = _TableFieldNames<Schema, T>
export type TableFields<T extends TableNames> = _TableFields<Schema, T>
export type TableRelations<T extends TableNames> = _TableRelations<Schema, T>
export type TableRelationNames<T extends TableNames> = _TableRelationNames<Schema, T>
export type TableRelation<T extends TableNames, R extends TableRelationNames<T>> = _TableRelation<Schema, T, R>
export type TableItem<T extends TableNames> = Prettify<_TableItem<Schema, T>>
export type QueryParams<T extends TableNames> = _QueryParams<T>
export type TableColumnType<T extends TableNames, C extends TableColumnNames<T>> = _TableColumnType<Schema, T, C>
export type TablePrimaryKey<T extends TableNames> = PrimaryKeyColumn<Schema, T>
export type TablePrimaryKeyValue<T extends TableNames> = _TablePrimaryKeyValue<Schema, T>

export type ConditionTree<T extends TableNames> = _ConditionTree<Schema, T>
