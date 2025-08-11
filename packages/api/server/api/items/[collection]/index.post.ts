/**
 * Create a new item in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const payload = await ensureValidItem(collection, false, event)

  const { createOne } = useDb()

  const item = await createOne(collection, payload)

  emitMessage(event, {
    type: 'items:created',
    data: { collection, id: item.id }
  })

  return item
})
