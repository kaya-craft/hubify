import { knex, type Knex } from 'knex'
import { SchemaInspector } from 'knex-schema-inspector'
import type { Column } from 'knex-schema-inspector/dist/types/column'
import type { Schema, TableNames, QueryParams, Item } from './../types'
import { normalizeOrderBy, normalizeColumns, buildWhereQuery, buildJoins, getPrimaryKeyColumn } from './helpers'
import { isNumber, isArray } from '@hubify/api/utils/types'

/**
 * Create a database instance using Knex and Schema Inspector.
 */
export function createDatabaseInstance<S extends Schema>(config: Knex.Config, schema: S) {
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
  function find<T extends TableNames<S>>(table: T, query: QueryParams<S, T> = {}) {
    const builder = db(table)

    if (isNumber(query.limit)) builder.limit(query.limit)
    if (isNumber(query.offset)) builder.offset(query.offset)
    if (isArray(query.groupBy)) builder.groupBy(normalizeColumns(schema, table, query.groupBy))
    if (isArray(query.orderBy)) {
      normalizeOrderBy(schema, table, query.orderBy).forEach((col) => {
        return col.startsWith('-') ? builder.orderBy(col.slice(1), 'desc') : builder.orderBy(col, 'asc')
      })
    }
    if (isArray(query.columns)) builder.select(normalizeColumns(schema, table, query.columns))
    if (query.where) builder.where(buildWhereQuery(schema, table, query.where))

    buildJoins(schema, table, query)(builder)

    return builder
  }

  /**
   * Find one record in a table.
   */
  function findOne<T extends TableNames<S>>(table: T, pk: TablePrimaryKeyValue<S, T>, query: QueryParams<S, T> = {}) {
    const key = getPrimaryKeyColumn(schema, table)
    return find(table, query).where(key, pk).first()
  }

  /**
   * Create an item in a table.
   */
  function createOne<T extends TableNames<S>>(table: T, data: Partial<Item<S, T>>) {
    const key = getPrimaryKeyColumn(schema, table)

    const query = db(table).insert(data).returning(key)

    return query
  }

  /**
   * Update an item in a table.
   */
  function updateOne<T extends TableNames<S>>(table: T, pk: TablePrimaryKeyValue<S, T>, data: Partial<Item<S, T>>) {
    const key = getPrimaryKeyColumn(schema, table)

    const query = db(table).update(data).where(key, pk).returning(key)

    return query
  }

  /**
   * Update multiple items in a table.
   */
  function update<T extends TableNames<S>>(table: T, data: Partial<Item<S, T>>, where: NonNullable<QueryParams<S, T>['where']>) {
    const builder = db(table)

    builder.where(buildWhereQuery(schema, table, where))

    const key = getPrimaryKeyColumn(schema, table)

    const query = builder.update(data).returning(key)

    return query
  }

  /**
   * Delete an item in a table.
   */
  function removeOne<T extends TableNames<S>>(table: T, pk: TablePrimaryKeyValue<S, T>) {
    const key = getPrimaryKeyColumn(schema, table)

    const query = db(table).delete().where(key, pk).returning(key)

    return query
  }

  /**
   * Delete multiple items in a table.
   */
  function remove<T extends TableNames<S>>(table: T, where: NonNullable<QueryParams<S, T>['where']>) {
    const builder = db(table)

    builder.where(buildWhereQuery(schema, table, where))

    const key = getPrimaryKeyColumn(schema, table)

    const query = builder.delete().returning(key)

    return query
  }

  return {
    getTableNames,
    getTableDefinition,
    getSchema,
    db,
    find,
    findOne,
    createOne,
    update,
    updateOne,
    removeOne,
    remove
  }
}
