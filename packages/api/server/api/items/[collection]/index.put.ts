/**
 * Update items in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const [params, item] = await Promise.all([
    ensureValidQueryParams(collection, event),
    ensureValidInputItem(collection, true, event)
  ])

  const { update } = useDb()

  return ensureValidOutputItems(collection, update(collection, item, params)).then((items) => {
    for (const item of items) {
      emitMessage(event, {
        type: 'items:updated',
        data: { collection, item }
      })
    }

    return items
  })
})
