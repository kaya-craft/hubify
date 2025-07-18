import type { Schema } from '@hubify/restql'

export type TableColumns = Schema[string]['columns']

export type TableRelations = Schema[string]['relations']

export function defineTableColumns<const C extends TableColumns>(columns: C): C {
  return columns
}

export function defineTableRelations<const R extends TableRelations>(relations: R): R {
  return relations
}
