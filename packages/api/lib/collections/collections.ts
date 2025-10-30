import type { TableDefinition } from '@hubify/api/database/types'

/**
 * Define a collection schema.
 */
export function defineCollection<const T extends TableDefinition>(definition: T) {
  return definition
}

/**
 * Add timestamps to a collection definition.
 */
export function withTimestamps<const T extends TableDefinition>(fields: T) {
  return {
    ...fields,
    createdAt: {
      type: 'datetime',
      default: '{CURRENT_TIMESTAMP}'
    },
    updatedAt: {
      type: 'datetime',
      default: '{CURRENT_TIMESTAMP}'
    }
  } as const satisfies TableDefinition
}

/**
 * Add default numeric ID to a collection definition.
 */
export function withId<const T extends TableDefinition>(fields: T) {
  return {
    id: {
      type: 'integer',
      primary: true,
      autoIncrement: true
    },
    ...fields
  } as const satisfies TableDefinition
}

/**
 * Add default string ID to a collection definition.
 */
export function withUuid<const T extends TableDefinition>(fields: T) {
  return {
    id: {
      type: 'uuid',
      primary: true
    },
    ...fields
  } as const satisfies TableDefinition
}

/**
 * Add default fields to a collection definition.
 */
export function withDefaults<const T extends TableDefinition>(fields: T) {
  return withId(withTimestamps(fields))
}
