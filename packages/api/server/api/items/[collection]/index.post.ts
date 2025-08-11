/**
 * Create a new item in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const item = await ensureValidItem(collection, false, event)

  const { createOne } = useDb()

  return createOne(collection, item)
})
