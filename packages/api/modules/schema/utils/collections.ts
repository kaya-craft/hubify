import type { TableDefinition } from '@hubify/api/lib/database/types.d'

/**
 * Define a collection schema.
 */
export function defineCollection<const T extends CollectionDefinition>(definition: T) {
  return definition
}

/**
 * Add timestamps to a collection definition.
 */
export function withTimestamps<const T extends CollectionDefinition['fields']>(fields: T) {
  return {
    ...fields,
    createdAt: {
      type: 'datetime',
      default: 'now'
    },
    updatedAt: {
      type: 'datetime',
      default: 'now'
    }
  } satisfies CollectionDefinition['fields']
}

/**
 * Add default numeric ID to a collection definition.
 */
export function withId<const T extends CollectionDefinition['fields']>(fields: T) {
  return {
    id: {
      type: 'integer',
      primary: true,
      autoIncrement: true
    },
    ...fields
  } satisfies CollectionDefinition['fields']
}

/**
 * Add default string ID to a collection definition.
 */
export function withUuid<const T extends CollectionDefinition['fields']>(fields: T) {
  return {
    id: {
      type: 'uuid',
      primary: true
    },
    ...fields
  } satisfies CollectionDefinition['fields']
}

/**
 * Add default fields to a collection definition.
 */
export function withDefaults<const T extends CollectionDefinition['fields']>(fields: T) {
  return withId(withTimestamps(fields))
}

export interface CollectionDefinition extends TableDefinition {
  name?: string
}
