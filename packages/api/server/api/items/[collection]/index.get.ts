/**
 * List items in a specified collection with query parameters.
 */
export default defineEventHandler(async (event) => {
  const collection = await ensureValidCollection(event)
  const params = await ensureValidQueryParams(collection, event)
  const paginate = getQuery(event).paginate !== 'false' && (isNumber(params.limit) || isNumber(params.offset))
  const { find, db } = useDatabase()

  try {
    const [items, total] = await Promise.all([
      find(collection, params),
      paginate ? db(collection).count({ count: '*' }).then(res => res?.[0]?.count ? Number(res[0].count) : 0) : null
    ])

    if (!items) {
      throw createError({
        status: 404,
        message: 'Items not found'
      })
    }

    return paginateOutput(items, total, params.limit, params.offset)
  }
  catch (error) {
    throw createError(String(error) || 'An error occurred while fetching items')
  }
})

/**
 * Paginate output if necessary.
 */
function paginateOutput<T>(
  items: T[],
  total: number | null,
  limit: number | undefined,
  offset: number | undefined
) {
  if (isNumber(total)) {
    return {
      items,
      page: total > 0 && isNumber(limit) ? Math.floor((offset || 0) / limit) + 1 : 1,
      perPage: isNumber(limit) ? limit : total,
      total
    }
  }

  return items
}
