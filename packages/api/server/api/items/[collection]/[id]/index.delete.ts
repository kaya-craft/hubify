/**
 * Remove an item in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)
  const [pk, params] = await Promise.all([
    ensureValidId(collection, event),
    ensureValidQueryParams(collection, event)
  ])

  await ensureUserHasPermission(event, {
    collection,
    action: 'remove'
  })

  const { removeOne } = useDatabase()

  try {
    const itemId = await removeOne(collection, pk, params.where)

    if (!itemId) {
      throw createError({
        status: 404,
        message: 'Item not found'
      })
    }
    emitMessage(event, {
      type: 'items:deleted',
      data: { collection, id: pk }
    })

    return itemId
  }
  catch (error) {
    throw createError(String(error) || 'An error occurred while deleting the item')
  }
})
