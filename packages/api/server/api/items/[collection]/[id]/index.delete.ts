/**
 * Remove an item in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const [id, params] = await Promise.all([
    ensureValidId(collection, event),
    ensureValidQueryParams(collection, event)
  ])

  const { removeOne } = useDb()

  await removeOne(collection, id, params)

  emitMessage(event, {
    type: 'items:deleted',
    data: { collection, id }
  })

  return id
})
