import type { DataType, DataTypes } from './data-types'
import type { OPERATORS } from './operators'

export interface Schema {
  [table: string]: TableDefinition
}

export interface TableDefinition {
  [field: string]: FieldDefinition
}

export interface BaseColumnDefinition {
  nullable?: boolean
  unique?: boolean
  default?: unknown
  length?: number
  precision?: number
  scale?: number
  options?: string[] | readonly string[]
}

type BaseRelationDefinition = BaseColumnDefinition & {
  table: string
  onDelete?: RelationAction
  onUpdate?: RelationAction
  foreignKey?: string
}

export type RelationAction = 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT' | null

export type ColumnDefinition = BaseColumnDefinition & {
  type: DataTypes
  primary?: boolean
  autoIncrement?: boolean
}

export type OneRelationTypes = 'one-to-many' | 'many-to-one' | 'one-to-one'
export type ManyRelationTypes = 'many-to-many'

export type RelationDefinition = BaseRelationDefinition & ({
  type: OneRelationTypes
} | {
  type: ManyRelationTypes
  through: string
  throughKey: string
})

export type FieldDefinition = ColumnDefinition | RelationDefinition

export type TableNames<S extends Schema> = keyof S & string

export type TableFields<S extends Schema, T extends TableNames<S>> = S[T] extends infer F ? F : never
export type TableFieldNames<S extends Schema, T extends TableNames<S>> = keyof TableFields<S, T> & string

export type TableColumnNames<S extends Schema, T extends TableNames<S>> = {
  [K in keyof TableFields<S, T>]: TableFields<S, T>[K] extends ColumnDefinition ? K : never
}[keyof TableFields<S, T>] & string

export type TableRelationNames<S extends Schema, T extends TableNames<S>> = {
  [K in keyof TableFields<S, T>]: TableFields<S, T>[K] extends RelationDefinition ? K : never
}[keyof TableFields<S, T>] & string

export type TableColumns<S extends Schema, T extends TableNames<S>> = Pick<TableFields<S, T>, TableColumnNames<S, T>>

export type TableColumn<S extends Schema, T extends TableNames<S>, C extends TableColumnNames<S, T>> = TableColumns<S, T>[C]

export type TableRelations<S extends Schema, T extends TableNames<S>> = Pick<TableFields<S, T>, TableRelationNames<S, T>>
export type TableRelation<S extends Schema, T extends TableNames<S>, R extends TableRelationNames<S, T>> = TableRelations<S, T>[R] extends infer F extends RelationDefinition ? F & Omit<RelationDefinition, F> : never

export type TableItem<S extends Schema, T extends TableNames<S>, Deep = true> = Prettify<{
  [K in TableFieldNames<S, T>]: K extends TableRelationNames<S, T>
    ? TableRelation<S, T, K> extends infer Relation
      ? Relation extends { type: OneRelationTypes }
        ? TableColumnType<S, Relation['table'], RelationForeignKey<S, T, K>> | (Deep extends true ? Prettify<Item<S, Relation['table']>> | null : never)
        : Relation extends { type: ManyRelationTypes }
          ? Deep extends true ? Prettify<Item<S, Relation['table']>>[] : never
          : never
      : never
    : K extends TableColumnNames<S, T>
      ? TableColumnType<S, T, K>
      : never
}>

export interface QueryParams<S extends Schema = Schema, T extends TableNames<S> = TableNames<S>> {
  fields?: FieldName<S, T>[]
  where?: ConditionTree<S, T>
  orderBy?: `${'' | '-'}${FieldName<S, T, T, false>}`[]
  groupBy?: FieldName<S, T, T, false>[]
  limit?: number
  offset?: number
}

export type ConditionTree<S extends Schema, T extends TableNames<S>> = {
  [K in FieldName<S, T>]?: Condition
} & {
  $and?: ConditionTree<S, T>[]
  $or?: ConditionTree<S, T>[]
}

export type RelatedFieldName<S extends Schema, T extends TableNames<S>, ParentTable = T, Placeholder = true> = TableRelationNames<S, T> extends infer Names ? {
  [K in Names]: TableRelation<S, T, K>['table'] extends infer RelatedTable
    ? RelatedTable extends ParentTable
      ? never
      : `${K}.${FieldName<S, RelatedTable, T, Placeholder>}` | (TableRelation<S, T, K> extends { type: OneRelationTypes } ? K : never)
    : never
}[Names] & string : never

export type FieldName<S extends Schema, T extends TableNames<S>, RootTable = T, Placeholder = true> = TableColumnNames<S, T> | (Placeholder extends true ? `*` : never) | RelatedFieldName<S, T, RootTable, false>

export type LogicalOperator = 'and' | 'or'
export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
export type OrderByDirection = 'asc' | 'desc'
export type Operator = keyof typeof OPERATORS

export type Condition = {
  [O in Operator]?: Value
}

export type PrimaryKeyColumn<S extends Schema, T extends TableNames<S>> = {
  [K in TableColumnNames<S, T>]: TableFields<S, T>[K] extends { primary: true } ? K : never
}[TableColumnNames<S, T>]

export type TablePrimaryKeyValue<S extends Schema, T extends TableNames<S>> = TableColumnType<TableColumn<S, T, PrimaryKeyColumn<S, T>>>

export type RelationForeignKey<S extends Schema, T extends TableNames<S>, R extends TableRelationNames<S, T>> = TableRelation<S, T, R> extends { foreignKey: infer FK } ? FK : PrimaryKeyColumn<S, TableRelation<S, T, R>['table']>

export type TableColumnType<S extends Schema, T extends TableNames<S>, C extends TableColumnNames<S, T>> = DataType<TableColumn<S, T, C>['type']>

export type Prettify<T> = { [K in keyof T]: T[K] } & {}
