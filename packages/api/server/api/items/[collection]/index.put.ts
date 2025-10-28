/**
 * Update items in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const [params, item] = await Promise.all([
    ensureValidQueryParams(collection, event),
    ensureValidInputItem(collection, true, event)
  ])

  await ensureUserHasPermission(event, {
    collection,
    params,
    item,
    action: 'update'
  })

  const { update } = useDatabase()

  try {
    const items = await update(collection, item, params.where)

    for (const item of items) {
      emitMessage(event, {
        type: 'items:updated',
        data: { collection, item }
      })
    }

    return items
  }
  catch (error) {
    throw createError(String(error) || 'An error occurred while updating the items')
  }
})
