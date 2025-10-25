import type { TableNames } from '@hubify/api/types/schema'
import type { FieldOptions } from '@hubify/app/types/fields'

/**
 * Define collection fields.
 */
export function defineCollectionFields<const F extends FieldOptions<TableNames>>(fields: F) {
  return fields
}
