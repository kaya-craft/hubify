import type { NuxtError } from '#app'
import tables from '#hubify/schema'
import { getPrimaryKeyColumn } from '@hubify/api/database/helpers'
import type z from 'zod'

export function useCollection<T extends TableNames>(collection: T) {
  const { alert, success } = useCustomToast()
  const { t } = useI18n()
  const { getRelation, columnNames, primaryKey, getColumn } = useTable(collection)
  const loading = ref(false)

  /**
   * Add an item to the collection
   */
  async function add(body: z.Infer<TableFormSchema<T>>) {
    try {
      loading.value = true
      const response = await $fetch(`/api/items/${collection}` as `/api/items/:collection`, {
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
  async function remove(ids: TablePrimaryKeyValue<T>[]) {
    if (!ids.length) return

    try {
      loading.value = true

      const response = await $fetch(`/api/items/${String(collection)}`, {
        method: 'delete',
        query: {
          where: {
            [toValue(primaryKey)]: { $in: ids }
          }
        }
      })

      success(t('app.toast.delete-item.title'), t('app.toast.delete-item.success'))

      return response
    }
    catch (e) {
      console.error(e)
      alert(t('app.toast.create-item.title'), `${t('app.toast.create-item.error')} ${String(e)}`)
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
      const response = await $fetch(`/api/items/${collection}` as `/api/items/:collection`, {
        method: 'put',
        body,
        query
      })
      success(t('app.toast.update-item.title'), t('app.toast.update-item.success'))
      return response
    }
    catch (e) {
      console.error(e)
      alert(t('app.toast.update-item.title'), `${t('app.toast.update-item.error')} ${String(e)}`)
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

      const columnsToRemove = toValue(columnNames).filter(col => getColumn(col)?.primary || getColumn(col)?.default === '{CURRENT_TIMESTAMP}')

      const copy = Object.fromEntries(
        Object.entries(item).filter(([key]) => !columnsToRemove.includes(key as TableColumnNames<T>))
      )

      const response = await $fetch(`/api/items/${collection}` as `/api/items/:collection`, {
        method: 'post',
        body: copy
      })
      success(t('app.toast.duplicate-item.title'), t('app.toast.duplicate-item.success'))
      return response
    }
    catch (e) {
      console.error(e)
      alert(t('app.toast.duplicate-item.title'), `${t('app.toast.duplicate-item.error')} ${String(e)}`)
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

      await $fetch(`/api/items/${relation.table}` as `/api/items/:collection`, {
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

      await $fetch(`/api/items/${relation.table}`, {
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
    add,
    remove,
    update,
    attach,
    detach,
    duplicate
  }
}
