/**
 * Use collections composable.
 */
export function useCollections() {
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
      return item[col as keyof TableItem<T>]?.toString() ?? ''
    }).trim()
  }

  onHubifyHook('items', ({ collection }) => {
    if (collection !== 'hubify_collections') return
    refresh()
  })

  /**
   * Current collection from route (if any)
   */
  const currentCollection = computed(() => {
    const routeParams = useRoute().params as { collection?: string }
    if (!routeParams.collection) return

    return toValue(collections)?.find(c => c.name === routeParams.collection)
  })

  return {
    collections,
    extractDisplayColumns,
    getDisplay,
    currentCollection
  }
}

export const REGEX_EXTRACT_TEMPLATE_VARIABLE = /{{\s*?(?<name>.*?)\s*?}}/g
