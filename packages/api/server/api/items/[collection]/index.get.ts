/**
 * List items in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const params = await ensureValidQueryParams(collection, event)

  const { find } = useDb()

  return ensureValidOutputItems(collection, find(collection, params))
})
