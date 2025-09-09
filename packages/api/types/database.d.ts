/* eslint-disable @typescript-eslint/no-explicit-any */
import type { OPERATORS } from '@hubify/api/modules/schema/utils/database/operators'

export interface Schema {
  [table: string]: TableDefinition
}

export interface TableDefinition {
  columns: {
    [column: string]: ColumnDefinition
  }
  relations?: {
    [relation: string]: RelationDefinition
  }
}

export interface ColumnDefinition {
  type: DataTypes
  primaryKey?: boolean
  notNull?: boolean
  unique?: boolean
  default?: unknown
}

export interface RelationDefinition {
  table: string
  fromKey: string
  toKey: string
  through?: string
  throughKey?: string
}

export type TableNames<S extends Schema> = keyof S & string

export type TableColumns<S extends Schema, T extends TableNames<S>> = S[T] extends { columns: infer C } ? C : never
export type TableColumnNames<S extends Schema, T extends TableNames<S>> = keyof TableColumns<S, T> & string
export type TableColumn<S extends Schema, T extends TableNames<S>, C extends TableColumnNames<S, T>> = TableColumns<S, T>[C] extends infer U extends ColumnDefinition ? U : never

export type TableRelations<S extends Schema, T extends TableNames<S>> = S[T] extends { relations: infer R } ? R : never
export type TableRelationNames<S extends Schema, T extends TableNames<S>> = keyof TableRelations<S, T> & string
export type TableRelation<S extends Schema, T extends TableNames<S>, R extends TableRelationNames<S, T>> = TableRelations<S, T>[R] extends infer U extends RelationDefinition ? U : never

export type TableItem<S extends Schema, T extends TableNames<S>> = {
  [K in TableColumnNames<S, T>]: TableColumnType<S, T, K> | (K extends TableRelationNames<S, T> ? TableRelation<S, T, K> extends infer R extends { through: string }
    ? TableItem<S, R['table']>[]
    : TableItem<S, R['table']> | null
    : never)
}

export interface QueryParams<S extends Schema = Schema, T extends TableNames<S> = TableNames<S>> {
  columns?: FieldName<S, T>[]
  where?: ConditionTree<S, T>
  orderBy?: `${'' | '-'}${FieldName<S, T>}`[]
  groupBy?: FieldName<S, T>[]
  limit?: number
  offset?: number
}

export type ConditionTree<S extends Schema, T extends TableNames<S>> = {
  [K in FieldName<S, T>]?: Condition
} & {
  $and?: ConditionTree<S, T>[]
  $or?: ConditionTree<S, T>[]
}

type RelatedFieldName<S extends Schema, T extends TableNames<S>, RootTable = T> = TableRelationNames<S, T> extends infer Names ? {
  [K in Names]: TableRelation<S, T, K>['table'] extends infer RelatedTable
    ? RelatedTable extends RootTable
      ? never
      : `${K}.${FieldName<S, RelatedTable, RootTable>}`
    : never
}[Names] & string : never

export type FieldName<S extends Schema, T extends TableNames<S>, RootTable = T> = TableColumnNames<S, T> | '*' | RelatedFieldName<S, T, RootTable>

export type LogicalOperator = 'and' | 'or'
export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
export type OrderByDirection = 'asc' | 'desc'
export type Operator = keyof typeof OPERATORS

export type Condition = {
  [O in Operator]?: Value
}

export type PrimaryKeyColumn<S extends Schema, T extends TableNames<S>> = {
  [K in TableColumnNames<S, T>]: S[T]['columns'][K] extends { primaryKey: true } ? K : never
}[TableColumnNames<S, T>]

export type TablePrimaryKeyValue<S extends Schema, T extends TableNames<S>> = TableColumnType<TableColumn<S, T, PrimaryKeyColumn<S, T>>>

export type Item<S extends Schema, T extends TableNames<S>> = {
  [K in TableColumnNames<S, T>]: TableColumnType<S, T, K> | (K extends TableRelationNames<S, T> ? TableRelation<S, T, K> extends infer R extends { through: string }
    ? Item<S, R['table']>[]
    : Item<S, R['table']> | null
    : never)
}

export type TableColumnType<S extends Schema, T extends TableNames<S>, C extends TableColumnNames<S, T>> = DataType<TableColumn<S, T, C>['type']>

type DataType<T extends DataTypes>
  = T extends 'text' ? string
    : T extends 'float4' ? number
      : T extends 'boolean' ? boolean
        : T extends 'date' ? Date
          : T extends 'json' ? Record<string, any>
            : T extends 'int4' ? number
              : T extends 'int8' ? bigint
                : T extends 'timestamptz' ? Date
                  : T extends 'timestamp' ? Date
                    : T extends 'datetime' ? Date
                      : T extends 'uuid' ? string
                        : T extends 'varchar' ? string
                          : T extends 'numeric' ? number
                            : T extends 'integer' ? number
                              : never

export type DataTypes = 'text' | 'float4' | 'boolean' | 'date' | 'json' | 'integer' | 'int4' | 'int8' | 'timestamptz' | 'timestamp' | 'uuid' | 'varchar' | 'numeric' | 'datetime'
