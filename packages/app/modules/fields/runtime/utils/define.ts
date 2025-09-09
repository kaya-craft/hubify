import type { DataTypes } from '@hubify/api/types/database'
import type { FieldOptions } from '@hubify/app/types/fields'

/**
 * Define column options for the specified columns.
 */
export function defineFields<O extends FieldOptions<TableNames, TableColumns<TableNames>>>(options: O = {} as O): O {
  return options
}

/**
 * Define the current field accepted data types.
 * This is used to define the field data types in the `defineExpose` function.
 * It is used to provide type information for the field data types in the Vue SFC.
 */
export function defineFieldDataTypes(..._dataTypes: DataTypes[]) {
  // return defineExpose({ dataTypes })
}
