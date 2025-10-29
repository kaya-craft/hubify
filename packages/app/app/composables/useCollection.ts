import type { NuxtError } from '#app'
import registeredDisplays from '#hubify/displays'
import fields from '#hubify/fields'
import registeredInputs from '#hubify/inputs'
import tables from '#hubify/schema'
import { getPrimaryKeyColumn } from '@hubify/api/database/helpers'
import type z from 'zod'

import type { TableFieldOption } from '@@/types/fields'
import { isOneToManyRelation, isRelation } from '@hubify/api/database/helpers'
import type { AsyncComponentLoader } from 'vue'

const defaultInputs = {
  'text': defineAsyncComponent(registeredInputs.text),
  'system-one-to-many': defineAsyncComponent(registeredInputs['system-one-to-many'])
}

const defaultDisplays = {
  'text': defineAsyncComponent(registeredDisplays.text),
  'system-one-to-many': defineAsyncComponent(registeredDisplays['system-one-to-many'])
}


export function useCollection<T extends TableNames>(_collectionName: MaybeRefOrGetter<T>) {
  const { alert, success } = useCustomToast()
  const { t } = useI18n()
  const loading = ref(false)

  /**
   * Name of the collection.
   */
  const collectionName = computed(() => {
    return toValue(_collectionName)
  })

  /**
   * Collection definition.
   */
  const collection = computed(() => {
    const name = toValue(collectionName)
    if (!tables[name as keyof typeof tables]) throw new Error(`Collection "${name}" does not exist.`)
    return tables[name as keyof typeof tables] as Table<T>
  })

  /**
   * Columns of the collection.
   */
  const columns = computed(() => {
    return toValue(collection)
  })

  /**
   * Collection fields.
   */
  const collectionFields = computed(() => {
    const name = toValue(collectionName)
    if (!fields[name]) console.error(`Fields for table "${name}" do not exist.`)
    return fields[name]
  })

  /**
   * Collection relations.
   */
  const relations = computed(() => {
    return Object.fromEntries(Object.entries(toValue(collection)).filter(([_, def]) => isRelation(def))) as TableRelations<T>
  })

  /**
   * Primary key of the collection.
   */
  const primaryKey = computed(() => {
    return getPrimaryKeyColumn(tables, toValue(collectionName)) as TablePrimaryKey<T>
  })

  /**
   * Columns of the collection.
   */
  const columnNames = computed(() => {
    const keys = Object.keys(toValue(columns) || {}) as TableColumnNames<T>[]

    const fields = toValue(collectionFields)

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
    if (!collection.value || !isObject(collection.value) || !(name in collection.value)) throw new Error(`Column "${name}" does not exist in collection "${collectionName}".`)
    return collection.value[name as keyof typeof collection.value] as unknown as TableColumn<T, C>
  }

  /**
   * Get the item primary key value.
   */
  function getPrimaryKeyValue(item: TableItem<T>) {
    const key = toValue(primaryKey)
    if (!key) throw new Error(`Primary key for collection "${collectionName}" is not defined.`)
    return item[key as keyof typeof item] as TablePrimaryKeyValue<T>
  }

  /**
   * Get the field for the specified column.
   */
  function getColumnOption<C extends TableColumnNames<T>>(column: C) {
    return toValue(collectionFields)?.[column] as TableFieldOption<T, C> | undefined
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
      const collection = toValue(collectionName)
      if (isOneToManyRelation(getColumn(column))) {
        return h(defaultInputs['system-one-to-many'], {
          inheritAttrs: false,
          class: input?.class,
          collection,
          relation: column as never
        })
      }

      return h(defaultInputs.text, { class: input?.class })
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
      const collection = toValue(collectionName)

      if (isOneToManyRelation(getColumn(column))) {
        return h(defaultDisplays['system-one-to-many'], {
          class: display?.class,
          collection,
          relation: column as never
        })
      }

      return h(defaultDisplays.text, { class: display?.class })
    }

    const component = registeredDisplays[display.component as keyof typeof registeredDisplays]
    return defineAsyncComponent(component as AsyncComponentLoader)
  }

  /**
   * Get relation by name.
   */
  function getRelation<R extends TableRelationNames<T>>(name: R) {
    const rels = toValue(relations)
    if (!rels || !isObject(rels) || !(name in rels)) throw new Error(`Relation "${String(name)}" does not exist in collection "${toValue(collectionName)}".`)
    return rels[name] as TableRelation<T, R>
  }

  /**
   * Can create new items in the table?
   */
  function canCreate() {
    return toValue(collectionName) !== 'hubify_collections'
  }

  /**
   * Can delete items in the table?
   */
  function canDelete(_id: TablePrimaryKeyValue<T>) {
    return toValue(collectionName) !== 'hubify_collections'
  }

  /**
   * Can update items in the table?
   */
  function canUpdate(_id: TablePrimaryKeyValue<T>) {
    return true
  }


 
  /**
   * Add an item to the collection
   */
  async function add(body: z.Infer<TableFormSchema<T>>) {
    try {
      loading.value = true
      const response = await $fetch(`/api/items/${collectionName}` as `/api/items/:collection`, {
        method: 'post',
        body
      })
      success(t('app.toast.create-item.title'), t('app.toast.create-item.success'))
      return response
    }
    catch (e) {
      console.error((e as NuxtError).message)
      alert(t('app.toast.create-item.title'), t('app.toast.create-item.error'))
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Remove a list of item ids
   */
  async function remove(ids: MaybeRef<(string | number)[]>) {
    if (!toValue(ids).length) return
    try {
      loading.value = true
      const response = await $fetch(`/api/items/${collectionName}` as `/api/items/:collection`, {
        method: 'delete',
        query: {
          where: {
            id: {
              $in: toValue(ids)
            }
          }
        }
      })
      success(t('app.toast.delete-item.title'), t('app.toast.delete-item.success'))
      return response
    }
    catch (e) {
      console.error(e)
      alert(t('app.toast.create-item.title'), t('app.toast.create-item.error') + ' ' + String(e))
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Update items matching query
   */
  async function update(body: z.Infer<Partial<TableFormSchema<T>>>, query?: QueryParams<T>) {
    try {
      loading.value = true
      const response = await $fetch(`/api/items/${collectionName}` as `/api/items/:collection`, {
        method: 'put',
        body,
        query
      })
      success(t('app.toast.update-item.title'), t('app.toast.update-item.success'))
      return response
    }
    catch (e) {
      console.error(e)
      alert(t('app.toast.update-item.title'), t('app.toast.update-item.error') + ' ' + String(e))
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Duplicate an item
   */
  async function duplicate(item: TableItem<T>) {
    try {
      loading.value = true

      const columnsToRemove = toValue(columnNames).filter(col => getColumn(col)?.primary || getColumn(col)?.default === 'CURRENT_TIMESTAMP')

      const copy = Object.fromEntries(
        Object.entries(item).filter(([key]) => !columnsToRemove.includes(key as TableColumnNames<T>))
      )

      const response = await $fetch(`/api/items/${collectionName}` as `/api/items/:collection`, {
        method: 'post',
        body: copy
      })
      success(t('app.toast.duplicate-item.title'), t('app.toast.duplicate-item.success'))
      return response
    }
    catch (e) {
      console.error(e)
      alert(t('app.toast.duplicate-item.title'), t('app.toast.duplicate-item.error') + ' ' + String(e))
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Extract primary key values from IDs or items.
   */
  function _extractPrimaryKeyValues<T extends TableNames>(table: T, idsOrItems: (TablePrimaryKeyValue<T> | TableItem<T>)[]) {
    const primaryKey = getPrimaryKeyColumn(tables, table)

    if (!primaryKey) throw new Error(`Primary key for table "${table}" is not defined.`)

    const values = idsOrItems.map((idOrItem) => {
      if (typeof idOrItem === 'object') return idOrItem[primaryKey as keyof typeof idOrItem]
      return idOrItem
    }).filter(isNonNullish) as TablePrimaryKeyValue<T>[]

    return [primaryKey, [...new Set(values)]] as const
  }

  /**
   * Attach to the specified relation.
   */
  async function attach<R extends TableRelationNames<T>, RT extends TableRelation<T, R>['table']>(
    id: TablePrimaryKeyValue<T>,
    relationName: R,
    ...idOrItems: (TablePrimaryKeyValue<RT> | TableItem<RT>)[]) {
    try {
      loading.value = true

      const relation = getRelation(relationName)
      if (!relation.foreignKey) throw new Error(`Relation "${String(relationName)}" does not have a foreign key defined.`)

      const [primaryKey, ids] = _extractPrimaryKeyValues(relation.table, idOrItems)

      await $fetch('/api/items/' + relation.table as `/api/items/:collection`, {
        method: 'put',
        query: { where: { [primaryKey]: { $in: ids } } },
        body: { [relation.foreignKey]: id }
      })

      success(t('app.toast.attach-item.title', t('app.toast.attach-item.success')))
    }
    catch (error) {
      console.error(error)
      alert(t('app.toast.detach-item.title', t('app.toast.detach-item.success')))
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Detatch from the specified relation.
   */
  async function detach<R extends TableRelationNames<T>, RT extends TableRelation<T, R>['table']>(
    relationName: R,
    ...idOrItems: (TablePrimaryKeyValue<RT> | TableItem<RT>)[]) {
    try {
      loading.value = true

      const relation = getRelation(relationName)
      if (!relation.foreignKey) throw new Error(`Relation "${String(relationName)}" does not have a foreign key defined.`)

      const [primaryKey, ids] = _extractPrimaryKeyValues(relation.table, idOrItems)

      await $fetch('/api/items/' + relation.table, {
        method: 'put',
        query: { where: { [primaryKey]: { $in: ids } } },
        body: { [relation.foreignKey]: null }
      })

      success(t('app.toast.detach-item.title', t('app.toast.detach-item.success')))
    }
    catch (error) {
      console.error(error)
      alert(t('app.toast.detach-item.title', t('app.toast.detach-item.success')))
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    name: collectionName,
    collection,

    columnNames,
    collectionFields,
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

    add,
    remove,
    update,
    attach,
    detach,
    duplicate
  }
}
