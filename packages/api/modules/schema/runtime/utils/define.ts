import type { TableColumn, TableRelation } from '@hubify/restql'

export function defineTableColumns<const C extends SchemaColumns>(columns: C): C {
  return columns
}

export function defineTableRelations<const R extends SchemaRelations>(relations: R): R {
  return relations
}

export type Schema = typeof import('#hubify/schema').default
export type SchemaColumns = Record<string, TableColumn>
export type SchemaRelations = Record<string, TableRelation>
