/**
 * List items in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)

  const params = await ensureValidQueryParams(collection, event)

  const { find, db } = useDb()

  // @todo: optimize this later
  const [items, countResult] = await Promise.all([
    ensureValidOutputItems(collection, find(collection, params)),
    db.sql`SELECT COUNT(*) as count FROM {${collection}}`
  ])

  return {
    items,
    total_count: countResult.rows?.[0]?.count || 0
  }
})
