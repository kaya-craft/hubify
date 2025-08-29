import registeredDisplays from '#hubify/displays'
import registeredFields from '#hubify/fields'
import tables from '#hubify/schema'
import { getPrimaryKey } from '@hubify/restql/utils/helpers'
import type { AsyncComponentLoader } from 'vue'
import InputText from '~/components/fields/input-text.vue'

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
    return toValue(table)?.fields as TableColumnOptions<T> | undefined
  })

  /**
   * Primary key of the table.
   */
  const primaryKey = computed(() => {
    return getPrimaryKey(tables, toValue(tableName)) as TablePrimaryKey<T>
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
   * Get the item primary key value.
   */
  function getPrimaryKeyValue(item: TableItem<T>) {
    const key = toValue(primaryKey)
    if (!key) throw new Error(`Primary key for table "${tableName}" is not defined.`)
    return item[key as keyof typeof item] as TablePrimaryKeyValue<T>
  }

  /**
   * Get the field for the specified column.
   */
  function getColumnOption<C extends TableColumnNames<T>>(column: C) {
    return toValue(fields)?.[column] as unknown as TableColumnOption<T, C>
  }

  /**
   * Get the field for the specified column.
   */
  function getField<C extends TableColumnNames<T>>(column: C) {
    return getColumnOption(column)?.field || false
  }

  /**
   * Get the display for the specified column.
   */
  function getDisplay<C extends TableColumnNames<T>>(column: C) {
    return getColumnOption(column)?.display || false
  }

  /**
   * Get the field component for the specified column.
   */
  function getFieldComponent<C extends TableColumnNames<T>>(column: C) {
    const option = getColumnOption(column)

    if (!option || !option.field) return

    if (!option.field?.component) return InputText

    const component = registeredFields[option.field.component as keyof typeof registeredFields]

    return defineAsyncComponent(component as AsyncComponentLoader)
  }

  /**
   * Get the display component for the specified column.
   */
  function getDisplayComponent<C extends TableColumnNames<T>>(column: C, fallbackValue: string) {
    const option = getColumnOption(column)

    if (!option || !option.display || !option.display.component) return h('p', { class: 'text-sm' }, fallbackValue ?? '')

    const component = registeredDisplays[option.display.component as keyof typeof registeredDisplays]

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
    getDisplay,
    getDisplayComponent,
    getFieldComponent,
    primaryKey,
    getPrimaryKeyValue
  }
}
