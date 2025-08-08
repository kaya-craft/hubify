import tables from '#hubify/schema'
import registeredFields from '#hubify/fields'
import type { TableColumn as _TableColumn, ColumnTypeToTsType, PrimaryKey } from '@hubify/restql'
import type { AsyncComponentLoader } from 'vue'
import InputText from '~/components/fields/input-text.vue'
import { getPrimaryKey } from '@hubify/restql/utils/helpers'

export type TableNames = keyof typeof tables & string
export type Table<T extends TableNames> = typeof tables[T]
export type TableColumnNames<T extends TableNames> = keyof typeof tables[T]['columns'] & string
export type TableColumns<T extends TableNames> = typeof tables[T]['columns']
export type TableColumn<T extends TableNames, C extends TableColumnNames<T>> = typeof tables[T]['columns'][C] extends infer U extends _TableColumn ? U : never
export type TableFields<T extends TableNames> = Fields<TableColumns<T>>
export type TableField<T extends TableNames, C extends TableColumnNames<T>> = TableFields<T>[C] extends infer U extends Field ? U : never
export type TableFieldValue<T extends TableNames, C extends TableColumnNames<T>> = ColumnTypeToTsType<TableColumn<T, C>['type']>

export function useTable<T extends TableNames>(_tableName: MaybeRefOrGetter<T>) {
  /**
   * Name of the table.
   */
  const tableName = computed(() => {
    return toValue(_tableName) as T
  })

  /**
     * Table definition.
     */
  const table = computed(() => {
    const name = toValue(tableName)
    if (!tables[name]) throw new Error(`Table "${name}" does not exist.`)
    return tables[name] as Table<T>
  })

  /**
   * Columns of the table.
   */
  const columns = computed(() => {
    return toValue(table)?.columns as TableColumns<T>
  })

  /**
 * Columns of the table.
 */
  const columnNames = computed(() => {
    return Object.keys(toValue(columns)) as TableColumnNames<T>[]
  })

  /**
   * Table fields.
   */
  const fields = computed(() => {
    return toValue(table)?.fields as TableFields<T> | undefined
  })

  /**
   * Primary key of the table.
   */
  const primaryKey = computed(() => {
    return getPrimaryKey(tables, toValue(tableName)) as PrimaryKey<typeof tables, T>
  })

  /**
       * Get the column with the specified name.
       */
  function getColumn<C extends TableColumnNames<T>>(name: C) {
    const cols = toValue(columns)
    if (!(name in cols)) throw new Error(`Column "${name}" does not exist in table "${table}".`)
    return cols[name] as TableColumn<T, C> | undefined
  }

  /**
       * Get the field for the specified column.
       */
  function getField<C extends TableColumnNames<T>>(column: C) {
    return toValue(fields)?.[column] as TableField<T, C>
  }

  /**
       * Get the field component for the specified column.
       */
  function getFieldComponent<C extends TableColumnNames<T>>(column: C) {
    const field = getField(column)

    if (field === false) return

    if (!field?.component) return InputText

    const component = registeredFields[field.component as keyof typeof registeredFields]

    return defineAsyncComponent(component as AsyncComponentLoader)
  }

  return {
    name: tableName,
    table,
    columnNames,
    fields,
    columns,
    getColumn,
    getField,
    getFieldComponent,
    primaryKey
  }
}
