/**
 * Update an item in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)
  const [pk, params] = await Promise.all([
    ensureValidId(collection, event),
    ensureValidQueryParams(collection, event)
  ])

  const inputItem = await ensureValidInputItem(collection, true, event)

  await ensureUserHasPermission(event, {
    collection,
    action: 'update',
    params,
    item: inputItem
  })

  const { updateOne } = useDatabase()

  try {
    const item = await updateOne(collection, pk, inputItem, params.where)

    if (!item) {
      throw createError({
        status: 404,
        message: 'Item not found'
      })
    }

    emitMessage(event, {
      type: 'items:updated',
      data: { collection, item }
    })

    return item
  }
  catch (error) {
    throw createError(String(error) || 'An error occurred while updating the item')
  }
})
