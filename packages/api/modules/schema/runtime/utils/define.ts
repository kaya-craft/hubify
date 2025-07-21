import type { Schema as _Schema } from '@hubify/restql'

export function defineTableColumns<const C extends _Schema[string]['columns']>(columns: C): C {
  return columns
}

export function defineTableRelations<const R extends _Schema[string]['relations']>(relations: R): R {
  return relations
}

export type Schema = typeof import('#hubify/schema').default
