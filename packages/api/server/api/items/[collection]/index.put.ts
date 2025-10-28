/**
 * Update items in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const [params, item] = await Promise.all([
    ensureValidQueryParams(collection, event),
    ensureValidInputItem(collection, true, event)
  ])

  const { update } = useDatabase()

  return update(collection, item, params.where).then((items) => {
    for (const item of items) {
      emitMessage(event, {
        type: 'items:updated',
        data: { collection, item }
      })
    }

    return items
  })
})
