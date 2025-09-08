import { knex, type Knex } from 'knex'
import { SchemaInspector } from 'knex-schema-inspector'
import type { Column } from 'knex-schema-inspector/dist/types/column'

/**
 * Create a database instance using Knex and Schema Inspector.
 */
export function createDatabaseInstance(config: Knex.Config) {
  const db = knex(config)
  const inspector = SchemaInspector(db)

  /**
     * Get the list of tables.
     */
  async function getTableNames() {
    return await inspector.tables()
  }

  /**
   * Get the table definition.
   */
  async function getTableDefinition(table: string) {
    const schema: Record<string, Column> = {}

    const columns = await inspector.columnInfo(table)
    for (const column of columns) {
      schema[column.name] = column
    }

    return schema
  }

  /**
     * Get the full schema.
     */
  async function getSchema() {
    const schema: Record<string, Record<string, Column>> = {}

    for (const table of await getTableNames()) {
      schema[table] ??= await getTableDefinition(table)
    }

    return schema
  }

  /**
   * Find records in a table.
   */
  function find(table: TableNames, query: FindQuery) {
    let builder = db(table).select(query.columns || '*')

    if (query.where) {
      for (const [key, value] of Object.entries(query.where)) {
        if (typeof value === 'object' && value !== null) {
          for (const [op, v] of Object.entries(value)) {
            switch (op) {
              case '$eq':
                builder = builder.where(key, '=', v)
                break
              case '$ne':
                builder = builder.where(key, '!=', v)
                break
              case '$gt':
                builder = builder.where(key, '>', v)
                break
              case '$gte':
                builder = builder.where(key, '>=', v)
                break
              case '$lt':
                builder = builder.where(key, '<', v)
                break
              case '$lte':
                builder = builder.where(key, '<=', v)
                break
              case '$in':
                if (Array.isArray(v)) {
                  builder = builder.whereIn(key, v)
                }
                break
              case '$nin':
                if (Array.isArray(v)) {
                  builder = builder.whereNotIn(key, v)
                }
                break
              case '$like':
                builder = builder.where(key, 'like', v)
                break
              case '$nlike':
                builder = builder.where(key, 'not like', v)
                break
              case '$null':
                if (v) {
                  builder = builder.whereNull(key)
                }
                else {
                  builder = builder.whereNotNull(key)
                }
                break
              case '$nstartsWith':
                builder = builder.whereNot(key, 'like', `${v}%`)
                break
              case '$startsWith':
                builder = builder.where(key, 'like', `${v}%`)
                break
              default:
                throw new Error(`Unsupported operator: ${op}`)
            }
          }
        }
        else {
          builder = builder.where(key, '=', value)
        }
      }
    }
  }

  return {
    getTableNames,
    getTableDefinition,
    getSchema,
    db
  }
}
