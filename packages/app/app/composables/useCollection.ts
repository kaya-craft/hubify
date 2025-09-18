import tables from '#hubify/schema'
import type { QueryParams } from '@hubify/restql'
import { getPrimaryKey } from '@hubify/restql/utils/helpers'
import type z from 'zod'

export function useCollection<T extends TableNames>(collection: T) {
  const { alert, success } = useCustomToast()
  const { t } = useI18n()

  const loading = ref(false)

  /**
   * Add an item to the collection
   */
  async function create(body: z.Infer<TableFormSchema<T>>) {
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
      console.error(e)
      alert(t('app.toast.create-item.title'), t('app.toast.create-item.error') + ' ' + String(e))
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
      const response = await $fetch(`/api/items/${collection}` as `/api/items/:collection`, {
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
  async function update(body: z.Infer<Partial<TableFormSchema<T>>>, query?: QueryParams<Schema, T>) {
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
      alert(t('app.toast.update-item.title'), t('app.toast.update-item.error') + ' ' + String(e))
    }
    finally {
      loading.value = false
    }
  }

  const { getRelation } = useTable(collection)
  /**
   * Extract primary key values from IDs or items.
   */
  function _extractPrimaryKeyValues<T extends TableNames>(table: T, idsOrItems: (TablePrimaryKeyValue<T> | TableItem<T>)[]) {
    const primaryKey = getPrimaryKey(tables, table)

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
      const [primaryKey, ids] = _extractPrimaryKeyValues(relation.table, idOrItems)

      await $fetch('/api/items/' + relation.table as `/api/items/:collection`, {
        method: 'put',
        query: { where: { [primaryKey]: { $in: ids } } },
        body: { [relation.toKey]: id }
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
      const [primaryKey, ids] = _extractPrimaryKeyValues(relation.table, idOrItems)

      await $fetch('/api/items/' + relation.table, {
        method: 'put',
        query: { where: { [primaryKey]: { $in: ids } } },
        body: { [relation.toKey]: null }
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
    create,
    remove,
    update,
    attach,
    detach
  }
}
