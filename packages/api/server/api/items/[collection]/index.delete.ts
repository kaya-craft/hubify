/**
 * Remove items in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)
  const params = await ensureValidQueryParams(collection, event)
  const shouldProceed = await ensureUserHasPermission(event, {
    collection,
    params,
    action: 'remove'
  })

  if (!shouldProceed) return { succes: true }

  const { remove } = useDatabase()

  try {
    const items = await remove(collection, params.where)

    for (const item of items) {
      emitMessage(event, {
        type: 'items:deleted',
        data: { collection, item }
      })
    }

    return items
  }
  catch (error) {
    throw createError(String(error) || 'An error occurred while deleting the items')
  }
})
