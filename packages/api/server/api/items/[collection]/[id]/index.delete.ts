/**
 * Remove an item in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)
  const [pk, params] = await Promise.all([
    ensureValidId(collection, event),
    ensureValidQueryParams(collection, event)
  ])

  const shouldProceed = await ensureUserHasPermission(event, {
    collection,
    action: 'remove'
  })

  if (!shouldProceed) return { succes: true }

  try {
    const { removeOne } = useDatabase()

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
