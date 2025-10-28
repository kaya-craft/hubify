/**
 * Remove items in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const params = await ensureValidQueryParams(collection, event)

  const { remove } = useDatabase()

  try {
    const ids = await remove(collection, params.where)

    for (const id of ids) {
      emitMessage(event, {
        type: 'items:deleted',
        data: { collection, id }
      })
    }

    return ids
  }
  catch (error) {
    throw createError(String(error) || 'An error occurred while deleting the items')
  }
})
