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
  try {
    const item = await findOne(collection, id, params)
    if (!item) {
      throw createError({
        status: 404,
        message: 'Item not found'
      })
    }
    return await ensureValidOutputItem(collection, item)
  }
  catch (e) {
    throw createError(e)
  }
})
