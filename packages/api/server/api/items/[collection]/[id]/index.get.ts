/**
 * Fetch a single item from a specified collection by its ID.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const id = await ensureValidId(collection, event)

  const { findOne } = useDatabase()

  return findOne(collection, id)
})
