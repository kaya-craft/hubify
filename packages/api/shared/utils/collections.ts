import type { TableDefinition } from '@hubify/api/database/types'

/**
 * Define a collection schema.
 */
export function defineCollection<const T extends TableDefinition>(definition: T) {
  return definition
}
