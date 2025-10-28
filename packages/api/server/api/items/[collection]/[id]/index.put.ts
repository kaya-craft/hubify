/**
 * Update an item in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const [id, item] = await Promise.all([
    ensureValidId(collection, event),
    ensureValidInputItem(collection, true, event)
  ])

  const { updateOne } = useDatabase()

  return updateOne(collection, id, item).then((item) => {
    emitMessage(event, {
      type: 'items:updated',
      data: { collection, item }
    })

    return item
  })
})
