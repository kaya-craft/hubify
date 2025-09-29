/**
 * Update an item in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const [id, params, inputItem] = await Promise.all([
    ensureValidId(collection, event),
    ensureValidQueryParams(collection, event),
    ensureValidInputItem(collection, true, event)
  ])

  const { updateOne } = useDb()

  try {
    const item = await updateOne(collection, id, inputItem, params)
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
  catch (e) {
    throw createError(e)
  }
})
