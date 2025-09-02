/**
 * Fetch a single item from a specified collection by its ID.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const [id, params] = await Promise.all([
    ensureValidId(collection, event),
    ensureValidQueryParams(collection, event)
  ])

  const { findOne } = useDb()

  return ensureValidOutputItem(collection, findOne(collection, id, params))
})
