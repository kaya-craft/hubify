import type { TableNames as _TableNames, TableColumns as _TableColumns, TableColumnNames as _TableColumnNames, TableColumn as _TableColumn, TableRelations as _TableRelations, TableRelationNames as _TableRelationNames, TableRelation as _TableRelation, TableItem as _TableItem, QueryParams as _QueryParams, TableColumnType as _TableColumnType, TablePrimaryKeyValue as _TablePrimaryKeyValue, PrimaryKeyColumn, ConditionTree as _ConditionTree, ColumnDefinition, Prettify, TableFields as _TableFields, TableFieldNames as _TableFieldNames, TableFieldType as _TableFieldType } from '@hubify/api/database/types.d'
import type { defineCollection as _defineCollection } from '#imports'

declare global {
  const defineCollection: typeof _defineCollection
}

export type Schema = import('#hubify/schema').HubifySchema
export type Table<T extends TableNames> = Schema[T]
export type TableNames = _TableNames<Schema> & string

/**
 * COLUMNS
 */
export type TableColumns<T extends TableNames> = _TableColumns<Schema, T>
export type TableColumnNames<T extends TableNames> = _TableColumnNames<Schema, T>
export type TableColumn<T extends TableNames, C extends TableColumnNames<T>> = TableColumns<T>[C] extends infer U extends ColumnDefinition ? U : never
export type TableColumnType<T extends TableNames, C extends TableColumnNames<T>> = _TableColumnType<Schema, T, C>

/**
 * RELATIONS
 */
export type TableRelations<T extends TableNames> = _TableRelations<Schema, T>
export type TableRelationNames<T extends TableNames> = _TableRelationNames<Schema, T> & string
export type TableRelation<T extends TableNames, R extends TableRelationNames<T>> = Omit<_TableRelation<Schema, T, R>, 'table'> & { table: TableNames }

/**
 * FIELDS
 */
export type TableFields<T extends TableNames> = _TableFields<Schema, T>
export type TableFieldNames<T extends TableNames> = _TableFieldNames<Schema, T> & string
export type TableField<T extends TableNames, F extends TableFieldNames<T>> = TableFields<T>[F] extends infer U ? U : never
export type TableFieldType<T extends TableNames, F extends TableFieldNames<T>> = _TableFieldType<Schema, T, F>

export type TableItem<T extends TableNames> = Prettify<_TableItem<Schema, T>>
export type QueryParams<T extends TableNames> = _QueryParams<T>
export type TablePrimaryKey<T extends TableNames> = PrimaryKeyColumn<Schema, T>
export type TablePrimaryKeyValue<T extends TableNames> = _TablePrimaryKeyValue<Schema, T>

export type ConditionTree<T extends TableNames> = _ConditionTree<Schema, T>
