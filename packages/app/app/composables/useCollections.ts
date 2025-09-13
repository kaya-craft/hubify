/**
 * Use collections composable.
 */
export function useCollections() {
  /**
   * List of collections.
   **/
  const { data: collections, refresh } = useFetch<{ items: TableItem<'hubify_collections'>[], total_count: number }>('/api/items/hubify_collections')

  /**
   * Extract display columns from collection.
   */
  function extractDisplayColumns<T extends TableNames>(name: T) {
    const collection = toValue(collections)?.items?.find(collection => collection.name === name)

    if (!collection?.displayTemplate) return

    const matches = collection.displayTemplate.matchAll(REGEX_EXTRACT_TEMPLATE_VARIABLE).toArray()

    if (!matches?.length) return

    return matches.map(col => col?.groups?.name).filter(isNonNullish)
  }

  /**
   * Get display value from item and columns.
   */
  function getDisplay<T extends TableNames>(name: T, item: TableItem<T>) {
    const collection = toValue(collections)?.items?.find(collection => collection.name === name)

    if (!collection?.displayTemplate) return

    const columns = extractDisplayColumns(name)

    if (!columns?.length) return

    return collection.displayTemplate.replace(REGEX_EXTRACT_TEMPLATE_VARIABLE, (_, col) => {
      return item[col as keyof TableItem<T>]?.toString() ?? ''
    }).trim()
  }

  onHubifyHook('items', ({ collection }) => {
    if (collection !== 'hubify_collections') return
    refresh()
  })

  function getCollectionMeta<T extends TableNames>(name: T) {
    return toValue(collections)?.items?.find(collection => collection.name === name)
  }

  return {
    collections,
    extractDisplayColumns,
    getDisplay,
    getCollectionMeta
  }
}

export const REGEX_EXTRACT_TEMPLATE_VARIABLE = /{{\s*?(?<name>.*?)\s*?}}/g
