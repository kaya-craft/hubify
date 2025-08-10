/**
 * Update an item in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const [id, params, item] = await Promise.all([
    ensureValidId(collection, event),
    ensureValidQueryParams(collection, event),
    ensureValidItem(collection, true, event)
  ])

  const { updateOne } = useDb()

  await updateOne(collection, id, item, params)

  emitMessage(event, {
    type: 'items:updated',
    data: { collection, id }
  })

  return id
})
