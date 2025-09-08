/**
 * Remove an item in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const id = await ensureValidId(collection, event)

  const { removeOne } = useDatabase()

  return removeOne(collection, id).then((id) => {
    emitMessage(event, {
      type: 'items:deleted',
      data: { collection, id }
    })

    return id
  })
})
