/**
 * Remove an item in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const [id, params] = await Promise.all([
    ensureValidId(collection, event),
    ensureValidQueryParams(collection, event)
  ])

  const { removeOne } = useDb()

  return removeOne(collection, id, params)
})
