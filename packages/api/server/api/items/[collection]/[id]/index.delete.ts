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
    await removeOne(collection, pk, params.where)

    emitMessage(event, {
      type: 'items:deleted',
      data: { collection, id: pk }
    })

    return pk
  }
  catch (error) {
    throw createError(String(error) || 'An error occurred while deleting the item')
  }
})
