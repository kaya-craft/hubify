import type { OPERATORS } from './operators'

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
  type: string
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
export type TableColumnNames<S extends Schema, T extends TableNames<S>> = keyof S[T]['columns'] & string
export type TableRelationNames<S extends Schema, T extends TableNames<S>> = S[T] extends { relations: infer R } ? keyof R & string : never
export type TableRelations<S extends Schema, T extends TableNames<S>> = S[T] extends { relations: infer R } ? R : {}
export type TableRelation<S extends Schema, T extends TableNames<S>, R extends TableRelationNames<S, T>> = TableRelations<S, T>[R]
export type TableColumn<S extends Schema, T extends TableNames<S>, C extends TableColumnNames<S, T>> = S[T]['columns'][C]

export interface QueryParams<S extends Schema, T extends TableNames<S>> {
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

export type FieldName<S extends Schema, T extends TableNames<S>, TT extends TableNames<S> = T>
  = Extract<TableRelationNames<S, T> extends infer NR ? TableColumnNames<S, T> | {
    [K in NR]: K extends string ? TableRelation<S, T, K>['table'] extends infer RT ? RT extends TT ? never : `${K}.${FieldName<S, RT, TT>}` : never : never
  }[NR] : never, string>

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

export type TablePrimaryKeyValue<S extends Schema, T extends TableNames<S>> = ColumnDataType<S[T]['columns'][PrimaryKeyColumn<S, T>]['type']>

export type Item<S extends Schema, T extends TableNames<S>> = {
  [K in TableColumnNames<S, T>]: ColumnDataType<S[T]['columns'][K]['type']> | (K extends TableRelationNames<S, T> ? S[T]['relations'][K] extends { through: string, throughKey: string }
    ? Item<S, S[T]['relations'][K]['table']>[]
    : Item<S, S[T]['relations'][K]['table']> | null
    : never)
}

type ColumnDataType<T extends string> = T extends 'increments' | 'integer' | 'bigInteger' | 'float' | 'decimal' ? number
  : T extends 'boolean' ? boolean
    : T extends 'date' | 'datetime' | 'time' | 'timestamp' ? Date
      : T extends 'json' | 'jsonb' ? unknown
        : string | number | boolean | Date | null
