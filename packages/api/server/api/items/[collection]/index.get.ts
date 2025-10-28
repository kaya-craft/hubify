/**
 * List items in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const params = await ensureValidQueryParams(collection, event)

  const { find } = useDatabase()

  return find(collection, params)
})
