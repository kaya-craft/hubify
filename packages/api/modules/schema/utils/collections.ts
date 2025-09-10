import type { TableDefinition } from '@hubify/api/lib/database/types.d'

/**
 * Define a collection schema.
 */
export function defineCollection<T extends CollectionDefinition>(definition: T) {
  return definition
}

/**
 * Add timestamps to a collection definition.
 */
export function withTimestamps<T extends CollectionDefinition['columns']>(columns: T) {
  return {
    ...columns,
    createdAt: {
      type: 'datetime',
      default: 'now'
    },
    updatedAt: {
      type: 'datetime',
      default: 'now'
    }
  } satisfies CollectionDefinition['columns']
}

/**
 * Add default numeric ID to a collection definition.
 */
export function withId<T extends CollectionDefinition['columns']>(columns: T) {
  return {
    id: {
      type: 'integer',
      primary: true,
      autoIncrement: true
    },
    ...columns
  } satisfies CollectionDefinition['columns']
}

/**
 * Add default string ID to a collection definition.
 */
export function withUuid<T extends CollectionDefinition['columns']>(columns: T) {
  return {
    id: {
      type: 'uuid',
      primary: true
    },
    ...columns
  } satisfies CollectionDefinition['columns']
}

/**
 * Add default columns to a collection definition.
 */
export function withDefaults<T extends CollectionDefinition['columns']>(columns: T) {
  return withId(withTimestamps(columns))
}

export interface CollectionDefinition extends TableDefinition {
  name?: string
}
