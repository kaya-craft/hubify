/**
 * Fetch a single item from a specified collection by its ID.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)
  const [pk, params] = await Promise.all([
    ensureValidId(collection, event),
    ensureValidQueryParams(collection, event)
  ])

  await ensureUserHasPermission(event, {
    collection,
    params,
    action: 'read'
  })

  try {
    const { findOne } = useDatabase()

    const item = await findOne(collection, pk, params)

    if (!item) {
      throw createError({
        status: 404,
        message: 'Item not found'
      })
    }

    return item
  }
  catch (error) {
    throw createError(String(error) || 'An error occurred while fetching the item')
  }
})
