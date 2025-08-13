import z from 'zod'
import tables from '#hubify/schema'
import type { ColumnName, TableColumn, TableName } from '@hubify/restql'

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

/**
 * Special validation for the `where` clause in query parameters.
 */
export function whereValidation<T extends TableName<Schema>>(
  collection: T
) {
  const columns = Object.keys(tables[collection].columns)
  const operators = ['$eq', '$neq', '$gt', '$lt', '$gte', '$lte', '$like', '$nlike', '$in', '$nin'] as const

  const obj = columns.reduce((acc, column) => {
    acc[column] = z.object({
      ...operators.reduce((opAcc, operator) => {
        opAcc[operator] = z.any().optional()
        return opAcc
      }, {} as Record<typeof operators[number], z.ZodTypeAny>)
    }).transform(asNonEmptyObject).optional()
    return acc
  }, {} as Record<string, z.ZodTypeAny>)

  const rule = z.object(obj).transform(asNonEmptyObject)

  Object.assign(obj, {
    $and: z.array(rule).transform(asNonEmptyArray).optional(),
    $or: z.array(rule).transform(asNonEmptyArray).optional()
  })

  return rule
}

/**
 * Helper function to convert an array to a Zod schema that validates as an array of enums.
 */
function asEnumArray<T extends string>(arr: T[]) {
  return z.preprocess(value => typeof value === 'string' ? value.split(',') : value, z.array(z.enum(arr)))
}

/**
 * Helper function to convert a stringified object to an object.
 */
function asObject<T extends z.core.SomeType>(type: T) {
  return z.preprocess(value => typeof value === 'string' ? JSON.parse(value) : value, type)
}

/**
 * Helper function to ensure objects are not empty.
 */
function asNonEmptyObject(value: Record<string, unknown>) {
  const newValue = Object.fromEntries(Object.entries(value).filter(([_, value]) => isNotEmpty(value)))
  return Object.keys(newValue).length > 0 ? newValue : undefined
}

/**
 * Helper function to ensure arrays are not empty.
 */
function asNonEmptyArray(value: unknown[]) {
  const newValue = value.filter(isNotEmpty)
  return newValue.length > 0 ? newValue : undefined
}
