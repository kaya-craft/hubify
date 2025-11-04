import { getPrimaryKeyColumn } from '@hubify/api/database/helpers'
import tables from '#hubify/schema'

/**
 * Use collections composable.
 */
export function useCollections() {
  /**
   * Get primary key column for hubify_collections table.
   */
  const primaryKey = getPrimaryKeyColumn(tables, 'hubify_collections')

  /**
   * List of collections.
   **/
  const { data: collections, refresh } = useFetch('/api/items/hubify_collections')

  /**
   * Extract display columns from collection.
   */
  function extractDisplayColumns<T extends TableNames>(name: T) {
    const collection = toValue(collections)?.find(collection => collection.name === name)

    if (!collection?.displayTemplate) return

    const matches = collection.displayTemplate.matchAll(REGEX_EXTRACT_TEMPLATE_VARIABLE).toArray()

    if (!matches?.length) return

    return matches.map(col => col?.groups?.name).filter(isNonNullish)
  }

  /**
   * Get display value from item and columns.
   */
  function getDisplay<T extends TableNames>(name: T, item: TableItem<T>) {
    const collection = toValue(collections)?.find(collection => collection.name === name)

    if (!collection?.displayTemplate) return

    const columns = extractDisplayColumns(name)

    if (!columns?.length) return

    return collection.displayTemplate.replace(REGEX_EXTRACT_TEMPLATE_VARIABLE, (_, col) => {
      const value = item[col as keyof TableItem<T>]
      return value !== undefined ? String(value) : ''
    }).trim()
  }

  /**
   * Get collection meta by name.
   */
  function getCollectionMeta<T extends TableNames>(name: T) {
    return toValue(collections)?.find(collection => collection.name === name)
  }

  /**
   * Find a collection by its primary key.
   */
  function getCollectionByPk(pk: unknown) {
    return toValue(collections)?.find(collection => collection[primaryKey as keyof typeof collection] === pk)
  }

  /**
   * Find a collection name by its primary key.
   */
  function getCollectionNameByPk(pk: unknown) {
    const collection = getCollectionByPk(pk)
    return collection?.name
  }

  onHubifyHook('items', ({ collection }) => {
    if (!['hubify_collections', 'hubify_permissions'].includes(collection)) return
    refresh()
  })

  return {
    collections,
    extractDisplayColumns,
    getDisplay,
    getCollectionMeta,
    getCollectionByPk,
    getCollectionNameByPk
  }
}

export const REGEX_EXTRACT_TEMPLATE_VARIABLE = /{{\s*?(?<name>.*?)\s*?}}/g
