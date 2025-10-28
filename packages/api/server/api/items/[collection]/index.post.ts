/**
 * Create a new item in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const payload = await ensureValidInputItem(collection, false, event)

  const { createOne } = useDatabase()

  try {
    const item = await createOne(collection, payload)

    emitMessage(event, {
      type: 'items:created',
      data: { collection, item }
    })

    return item
  }
  catch (error) {
    throw createError(String(error) || 'An error occurred while creating the item')
  }
})
