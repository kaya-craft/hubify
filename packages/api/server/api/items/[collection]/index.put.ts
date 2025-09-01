/**
 * Update items in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const [params, item] = await Promise.all([
    ensureValidQueryParams(collection, event),
    ensureValidItem(collection, true, event)
  ])

  const { update } = useDb()

  const items = await update(collection, item, params)

  emitMessage(event, {
    type: 'items:updated',
    // @ts-expect-error - not typed
    data: { collection, items }
  })

  return items
})
