/**
 * Update items in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const [params, item] = await Promise.all([
    ensureValidQueryParams(collection, event),
    ensureValidItem(collection, true, event)
  ])

  const { update } = useDb()

  return update(collection, item, params)
})
