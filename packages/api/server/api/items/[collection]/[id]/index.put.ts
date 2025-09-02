/**
 * Update an item in a specified collection.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const [id, params, item] = await Promise.all([
    ensureValidId(collection, event),
    ensureValidQueryParams(collection, event),
    ensureValidInputItem(collection, true, event)
  ])

  const { updateOne } = useDb()

  return ensureValidOutputItem(collection, updateOne(collection, id, item, params)).then((item) => {
    emitMessage(event, {
      type: 'items:updated',
      data: { collection, item }
    })

    return item
  })
})
