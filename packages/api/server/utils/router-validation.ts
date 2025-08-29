import z from 'zod'
import tables from '#hubify/schema'
import type { ColumnName, TableColumn, TableName } from '@hubify/restql'
import { asEnumArray, asObject, whereValidation } from '@hubify/api/lib/validation'
import { columnTypeToZod } from '@hubify/api/lib/column-types'

/**
 * Validates the router parameters for a collection and returns the collection name.
 */
export async function ensureValidCollection(event = useEvent()) {
  const { collection } = await getValidatedRouterParams(event, z.object({
    collection: z.enum(Object.keys(tables) as TableName<typeof tables>[])
  }).parse)

  return collection
}

/**
 * Validates the router parameters for a collection and an ID, returning both.
 */
export async function ensureValidId(collection: TableName<typeof tables>, event = useEvent()) {
  const primaryKeyColumn = Object.values(tables[collection].columns).find(column => column.primaryKey)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: columnTypeToZod(primaryKeyColumn)
  }).parse)

  return id
}

/**
 * Validates the query parameters for a collection and returns the validated parameters.
 */
export async function ensureValidQueryParams(
  collection: TableName<typeof tables>,
  event = useEvent()
) {
  try {
    const columnNames = Object.keys(tables[collection].columns) as ColumnName<typeof tables, typeof collection>[]

    return await getValidatedQuery(event, z.object({
      columns: asEnumArray(columnNames).optional(),
      limit: z.coerce.number().int().optional(),
      offset: z.coerce.number().int().optional(),
      where: asObject(whereValidation(collection)).optional(),
      groupBy: asEnumArray(columnNames).optional(),
      orderBy: asEnumArray([...columnNames, ...columnNames.map(name => `-${name}` as const)]).optional()
    }).parse)
  }
  catch (error) {
    if (error instanceof z.ZodRealError) {
      const issues = JSON.parse(error.message) as { message: string }[]
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid query parameters',
        message: issues.map(({ message }) => message).join('\n')
      })
    }

    throw error
  }
}

/**
 * Validates the item for a collection and returns the validated item.
 */
export async function ensureValidItem(
  collection: TableName<typeof tables>,
  optional = false,
  event = useEvent()
) {
  const columnNames = Object.entries(tables[collection].columns)
    .filter(([_, col]) => !col.primaryKey)
    .map(([key]) => key) as ColumnName<typeof tables, typeof collection>[]

  const columnSchemas = Object.fromEntries(
    columnNames.map((name) => {
      const column = tables[collection].columns[name] as TableColumn
      const rule = columnTypeToZod(tables[collection].columns[name])
      if (optional || column.default || !column.notNull) {
        return [name, rule.optional()]
      }
      return [name, rule]
    })
  )

  return await readValidatedBody(event, z.object(columnSchemas).parse)
}
