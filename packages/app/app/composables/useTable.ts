import registeredDisplays from '#hubify/displays'
import registeredInputs from '#hubify/inputs'
import tables from '#hubify/schema'
import { isOneToManyRelation } from '@hubify/api/lib/column-types'
import { getPrimaryKey } from '@hubify/restql/utils/helpers'
import type { AsyncComponentLoader } from 'vue'

export function useTable<T extends TableNames>(_tableName: MaybeRefOrGetter<T>) {
  /**
   * Toast.
   */
  const { add } = useToast()

  /**
   * Loading state.
   */
  const loading = ref(false)

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
   * Table fields.
   */
  const tableFields = computed(() => {
    return toValue(table).fields as TableFieldOptions<T>
  })

  /**
   * Table relations.
   */
  const relations = computed(() => {
    return toValue(table).relations as TableRelations<T>
  })

  /**
   * Primary key of the table.
   */
  const primaryKey = computed(() => {
    return getPrimaryKey(tables, toValue(tableName)) as TablePrimaryKey<T>
  })

  /**
   * Columns of the table.
   */
  const columnNames = computed(() => {
    const keys = Object.keys(toValue(columns)) as TableColumnNames<T>[]

    const fields = toValue(tableFields)

    if (fields) {
      return keys.sort((a, b) => {
        const aIndex = (fields?.[a] && fields?.[a]?.order) ?? 0
        const bIndex = (fields?.[b] && fields?.[b]?.order) ?? 0
        return aIndex - bIndex
      })
    }

    return keys
  })

  /**
   * Displayed columns.
   */
  const displayedColumns = computed(() => {
    return toValue(columnNames).filter((name) => {
      return getDisplay(name) !== false
    })
  })

  /**
   * Displayed fields.
   */
  const displayedFields = computed(() => {
    return toValue(columnNames).filter((name) => {
      return getInput(name) !== false
    })
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
    return toValue(tableFields)?.[column] as TableFieldOption<T, C> | undefined
  }

  /**
   * Get column labeling.
   */
  function getColumnLabel<C extends TableColumnNames<T>>(column: C) {
    const columnOptions = getColumnOption(column)
    return (columnOptions && columnOptions.label) || titleCase(column)
  }

  /**
   * Get the input for the specified column.
   */
  function getInput<C extends TableColumnNames<T>>(column: C) {
    const columnOptions = getColumnOption(column)

    if (columnOptions === false || columnOptions?.input === false) return false

    return columnOptions?.input
  }

  /**
   * Get the display for the specified column.
   */
  function getDisplay<C extends TableColumnNames<T>>(column: C) {
    const columnOptions = getColumnOption(column)

    if (columnOptions === false || columnOptions?.display === false) return false

    return columnOptions?.display
  }

  /**
   * Get the input component for the specified column.
   */
  function getInputComponent<C extends TableColumnNames<T>>(column: C) {
    const input = getInput(column)

    if (input === false) return

    if (!input?.component) {
      if (isOneToManyRelation(toValue(tableName), column)) {
        return h(resolveComponent('InputsSystemOneToMany'), {
          inheritAttrs: false,
          class: input?.class,
          collection: toValue(tableName),
          relation: column
        })
      }

      return h(resolveComponent('InputsText'), { class: input?.class })
    }

    const component = registeredInputs[input.component as keyof typeof registeredInputs]

    return defineAsyncComponent(component as AsyncComponentLoader)
  }

  /**
   * Get the display component for the specified column.
   */
  function getDisplayComponent<C extends TableColumnNames<T>>(column: C) {
    const display = getDisplay(column)

    if (display === false) return

    if (!display?.component) {
      if (isOneToManyRelation(toValue(tableName), column)) {
        return h(resolveComponent('DisplaysSystemOneToMany'), {
          class: display?.class,
          collection: toValue(tableName),
          relation: column
        })
      }

      return h(resolveComponent('DisplaysText'), { class: display?.class })
    }

    const component = registeredDisplays[display.component as keyof typeof registeredDisplays]

    return defineAsyncComponent(component as AsyncComponentLoader)
  }

  /**
   * Get relation by name.
   */
  function getRelation<R extends TableRelationNames<T>>(name: R) {
    const rels = toValue(relations)
    if (!rels || !(name in rels)) throw new Error(`Relation "${String(name)}" does not exist in table "${toValue(tableName)}".`)
    return rels[name] as TableRelation<T, R>
  }

  /**
   * Can create new items in the table?
   */
  function canCreate() {
    return toValue(tableName) !== 'hubify_collections'
  }

  /**
   * Can delete items in the table?
   */
  function canDelete(_id: TablePrimaryKeyValue<T>) {
    return toValue(tableName) !== 'hubify_collections'
  }

  /**
   * Can update items in the table?
   */
  function canUpdate(_id: TablePrimaryKeyValue<T>) {
    return true
  }

  return {
    name: tableName,
    table,

    columnNames,
    tableFields,
    columns,

    displayedColumns,
    displayedFields,

    getColumn,
    getColumnLabel,

    getInput,
    getInputComponent,

    getDisplay,
    getDisplayComponent,

    primaryKey,
    getPrimaryKeyValue,

    canCreate,
    canDelete,
    canUpdate,

    relations,
    getRelation,

    loading
  }
}
