/**
 * Remove items in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const params = await ensureValidQueryParams(collection, event)

  const { remove } = useDb()

  return remove(collection, params).then((ids) => {
    for (const id of ids) {
      emitMessage(event, {
        type: 'items:deleted',
        data: { collection, id }
      })
    }

    return ids
  })
})
