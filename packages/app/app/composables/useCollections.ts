/**
 * Use collections composable.
 */
export function useCollections() {
  /**
     * Locale path.
     */
  const localePath = useLocalePath()

  /**
 * List of collections.
 **/
  const { data: collections, refresh } = useFetch('/api/items/hubify_collections', {
    transform: (data) => {
      return data.map(item => ({
        label: item.name,
        icon: item.icon || 'i-lucide-folder',
        color: item.color || 'primary',
        style: { color: `text-[${item.color}]` },
        description: item.description,
        displayTemplate: item.displayTemplate,
        to: localePath({ name: 'admin-items-collection', params: { collection: item.name } })
      }))
    }
  })

  /**
   * Extract display columns from collection.
   */
  function extractDisplayColumns<T extends TableNames>(name: T) {
    const collection = toValue(collections)?.find(collection => collection.label === name)

    if (!collection?.displayTemplate) return

    const matches = collection.displayTemplate.matchAll(REGEX_EXTRACT_TEMPLATE_VARIABLE).toArray()

    if (!matches?.length) return

    return matches.map(col => col?.groups?.name).filter(isNonNullish)
  }

  /**
   * Get display value from item and columns.
   */
  function getDisplay<T extends TableNames>(name: T, item: TableItem<T>) {
    const collection = toValue(collections)?.find(collection => collection.label === name)

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

  return {
    collections,
    extractDisplayColumns,
    getDisplay
  }
}

export const REGEX_EXTRACT_TEMPLATE_VARIABLE = /{{\s*?(?<name>.*?)\s*?}}/g
