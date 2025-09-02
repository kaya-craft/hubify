import z from 'zod'
import tables from '#hubify/schema'
import type { ColumnName, TableName } from '@hubify/restql'
import { asEnumArray, asObject, itemValidation, whereValidation } from '@hubify/api/lib/validation'
import { columnTypeToZod } from '@hubify/api/lib/column-types'
import type { TableItem } from '~/modules/schema/runtime/utils/define'

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

/**
 * Validates an input item for a collection and returns the validated item.
 */
export async function ensureValidInputItem<T extends TableNames>(
  collection: T,
  optional = false,
  event = useEvent()
) {
  const validateItem = itemValidation(collection, {
    includePrimaryKey: false,
    optional
  })

  return await readValidatedBody(event, validateItem.parse)
}

/**
 * Validates an output item for a collection and returns the validated item.
 */
export async function ensureValidOutputItem<T extends TableNames, I extends TableItem<T>>(
  collection: T,
  item: Partial<I> | Promise<Partial<I>>
) {
  const validateItem = itemValidation(collection, {
    includePrimaryKey: true,
    optional: true
  })

  return validateItem.parse(await item) as I
}

/**
 * Validates many output items for a collection and returns the validated items.
 */
export async function ensureValidOutputItems<T extends TableNames, I extends TableItem<T>>(
  collection: T,
  items: Partial<I>[] | Promise<Partial<I>[]>
) {
  const validateItem = itemValidation(collection, {
    includePrimaryKey: true,
    optional: true
  })

  return (await items).map(item => validateItem.parse(item)) as I[]
}
