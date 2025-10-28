import type { FieldDefinition } from '@hubify/api/database/types'

/**
 * Define the current field accepted data types.
 * This is used to define the field data types in the `defineExpose` function.
 * It is used to provide type information for the field data types in the Vue SFC.
 */
export function defineFieldDataTypes(..._dataTypes: FieldDefinition['type'][]) {
  // return defineExpose({ dataTypes })
}
