import registeredDisplays from '#hubify/displays'
import registeredInputs from '#hubify/inputs'
import tables from '#hubify/schema'
import { getPrimaryKey } from '@hubify/restql/utils/helpers'
import type { AsyncComponentLoader } from 'vue'
import InputText from '~/components/inputs/text.vue'

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
  const tableFields = computed(() => {
    return toValue(table)?.fields as TableFieldOptions<T> | undefined
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
    return toValue(tableFields)?.[column] as TableFieldOption<T, C>
  }

  /**
   * Get the input for the specified column.
   */
  function getInput<C extends TableColumnNames<T>>(column: C) {
    const columnOptions = getColumnOption(column)
    if (columnOptions === false) return

    return columnOptions.input
  }

  /**
   * Get the display for the specified column.
   */
  function getDisplay<C extends TableColumnNames<T>>(column: C) {
    const columnOptions = getColumnOption(column)
    if (columnOptions === false) return

    return columnOptions.display
  }

  /**
   * Get the input component for the specified column.
   */
  function getInputComponent<C extends TableColumnNames<T>>(column: C) {
    const option = getColumnOption(column)

    if (!option || !option.input) return

    if (!option.input?.component) return InputText

    const component = registeredInputs[option.input.component as keyof typeof registeredInputs]

    return defineAsyncComponent(component as AsyncComponentLoader)
  }

  /**
   * Get the display component for the specified column.
   */
  function getDisplayComponent<C extends TableColumnNames<T>>(column: C, fallbackValue: string) {
    const option = getColumnOption(column)

    // Only access option.display.class if option.display is an object
    const displayClass = (option && option !== false && option.display && typeof option.display === 'object' && 'class' in option.display)
      ? (option.display as { class?: string }).class
      : undefined
    const fallbackComponent = h('p', { class: displayClass }, fallbackValue ?? '')

    // Handle case where option is false or display is false
    if (!option || option === false || option.display === false) return fallbackComponent

    // Handle case where display is true (use default display)
    if (option.display === true) return fallbackComponent

    // Handle case where display is an object but no component specified
    if (!option.display || !option.display.component) {
      return fallbackComponent
    }

    const component = registeredDisplays[option.display.component as keyof typeof registeredDisplays]

    return defineAsyncComponent(component as AsyncComponentLoader)
  }

  return {
    name: tableName,
    table,
    columnNames,
    tableFields,
    columns,
    getColumn,

    getInput,
    getInputComponent,

    getDisplay,
    getDisplayComponent,

    primaryKey,
    getPrimaryKeyValue
  }
}
