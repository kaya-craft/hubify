/**
 *
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
        to: localePath({ name: 'admin-items-collection', params: { collection: item.name } })
      }))
    }
  })

  onHubifyHook('items', ({ collection }) => {
    if (collection !== 'hubify_collections') return
    refresh()
  })

  return {
    collections
  }
}
