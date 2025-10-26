/**
 * Fetch a single item from a specified collection by its ID.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const { findOne } = useDatabase()

  const [id, params] = await Promise.all([
    ensureValidId(collection, event),
    ensureValidQueryParams(collection, event)
  ])

  try {
    const item = await findOne(collection, id, params)

    if (!item) {
      throw createError({
        status: 404,
        message: 'Item not found'
      })
    }

    return item
  }
  catch (e) {
    throw createError(e)
  }
})
