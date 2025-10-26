/**
 * Remove an item in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const id = await ensureValidId(collection, event)

  const { removeOne } = useDatabase()

  try {
    const itemId = await removeOne(collection, id)

    if (!itemId) {
      throw createError({
        status: 404,
        message: 'Item not found'
      })
    }
    emitMessage(event, {
      type: 'items:deleted',
      data: { collection, id }
    })
    return itemId
  }
  catch (e) {
    throw createError(e)
  }
})
