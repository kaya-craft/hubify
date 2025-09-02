/**
 * Create a new item in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const payload = await ensureValidInputItem(collection, false, event)

  const { createOne } = useDb()

  return ensureValidOutputItem(collection, createOne(collection, payload)).then((item) => {
    emitMessage(event, {
      type: 'items:created',
      data: { collection, item }
    })

    return item
  })
})
