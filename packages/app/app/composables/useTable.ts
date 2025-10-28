import registeredDisplays from '#hubify/displays'
import registeredInputs from '#hubify/inputs'
import fields from '#hubify/fields'
import tables from '#hubify/schema'

import { getPrimaryKeyColumn, isRelation } from '@hubify/api/database/helpers'
import type { TableFieldOption } from '@@/types/fields'
import type { AsyncComponentLoader } from 'vue'

export function useTable<T extends TableNames>(_tableName: MaybeRefOrGetter<T>) {
  /**
   * Loading state.
   */
  const loading = ref(false)

  /**
   * Name of the table.
   */
  const tableName = computed(() => {
    return toValue(_tableName)
  })

  /**
   * Table definition.
   */
  const table = computed(() => {
    const name = toValue(tableName)
    if (!tables[name]) throw new Error(`Table "${name}" does not exist.`)
    return tables[name]
  })

  /**
   * Columns of the table.
   */
  const columns = computed(() => {
    return toValue(table)
  })

  /**
   * Table fields.
   */
  const tableFields = computed(() => {
    const name = toValue(tableName)
    if (!fields[name]) console.error(`Fields for table "${name}" do not exist.`)
    return fields[name]
  })

  /**
   * Table relations.
   */
  const relations = computed(() => {
    return Object.fromEntries(Object.entries(toValue(table)).filter(([_, def]) => isRelation(def))) as TableRelations<T>
  })

  /**
   * Primary key of the table.
   */
  const primaryKey = computed(() => {
    return getPrimaryKeyColumn(tables, toValue(tableName)) as TablePrimaryKey<T>
  })

  /**
   * Columns of the table.
   */
  const columnNames = computed(() => {
    const keys = Object.keys(toValue(columns) || {}) as TableColumnNames<T>[]

    const fields = toValue(tableFields)

    if (fields) {
      return keys.sort((a, b) => {
        const aIndex = isObject(fields?.[a]) ? fields[a].order ?? 0 : 0
        const bIndex = isObject(fields?.[b]) ? fields[b].order ?? 0 : 0
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
    if (!table.value || !(name in table.value)) throw new Error(`Column "${name}" does not exist in table "${table}".`)
    return table.value[name as keyof typeof table.value] as unknown as TableColumn<T, C>
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

    const component = registeredInputs[input!.component as keyof typeof registeredInputs]

    if (!component) throw new Error(`Input component "${input?.component}" is not registered.`)

    return h(defineAsyncComponent(component as AsyncComponentLoader), input?.props)
  }

  /**
   * Get the display component for the specified column.
   */
  function getDisplayComponent<C extends TableColumnNames<T>>(column: C) {
    const display = getDisplay(column)

    if (display === false) return

    const component = registeredDisplays[display!.component as keyof typeof registeredDisplays]

    if (!component) throw new Error(`Display component "${display?.component}" is not registered.`)

    return h(defineAsyncComponent(component as AsyncComponentLoader), {
      ...display?.props,
      claass: display?.class
    })
  }

  /**
   * Get relation by name.
   */
  function getRelation<R extends TableRelationNames<T>>(name: R) {
    const rels = toValue(relations)
    if (!rels || !isObject(rels) || !(name in rels)) throw new Error(`Relation "${String(name)}" does not exist in table "${toValue(tableName)}".`)
    const relation = rels[name] as TableRelation<T, R>
    return relation
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
