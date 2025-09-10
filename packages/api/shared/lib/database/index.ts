import knex, { type Knex } from 'knex'
import { SchemaInspector } from 'knex-schema-inspector'
import type { Column } from 'knex-schema-inspector/dist/types/column'
import type { Schema, TableNames, QueryParams, TablePrimaryKeyValue, TableItem } from './types'
import { normalizeOrderBy, normalizeColumns, buildWhereQuery, addJoinQueries, getPrimaryKeyColumn, wrapSingleResult } from './helpers'
import { isArray, isNumber } from '@hubify/api/utils/types'

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
      .select(normalizeColumns(schema, table, query.columns || ['*']))
      .where(buildWhereQuery(schema, table, query.where))

    if (isNumber(query.limit)) {
      builder.limit(query.limit)
    }

    if (isNumber(query.offset)) {
      builder.offset(query.offset)
    }

    if (isArray(query.groupBy)) {
      builder.groupBy(normalizeColumns(schema, table, query.groupBy))
    }

    if (isArray(query.orderBy)) {
      for (const [col, sort] of normalizeOrderBy(schema, table, query.orderBy)) {
        builder.orderBy(col, sort)
      }
    }

    addJoinQueries(schema, table, query, builder)

    return builder
  }

  /**
   * Find one record in a table.
   */
  function findOne<T extends TableNames<S>>(table: T, pk: TablePrimaryKeyValue<S, T>, query: QueryParams<S, T> = {}) {
    const key = getPrimaryKeyColumn(schema, table)

    const builder = find(table, query)
      .where(key, '=', pk)
      .first()

    return builder as knex.Knex.QueryBuilder<{}, TableItem<S, T>>
  }

  /**
   * Create an item in a table.
   */
  function createOne<T extends TableNames<S>>(table: T, data: Partial<TableItem<S, T>>) {
    const builder = db(table)
      .insert(data)
      .returning('*')

    return wrapSingleResult(builder) as knex.Knex.QueryBuilder<{}, TableItem<S, T>>
  }

  /**
   * Update an item in a table.
   */
  function updateOne<T extends TableNames<S>>(table: T, pk: TablePrimaryKeyValue<S, T>, data: Partial<TableItem<S, T>>) {
    const key = getPrimaryKeyColumn(schema, table)

    const builder = db(table)
      .update(data)
      .where(key, '=', pk)
      .returning(key)

    return wrapSingleResult(builder) as knex.Knex.QueryBuilder<{}, TablePrimaryKeyValue<S, T>>
  }

  /**
   * Update multiple items in a table.
   */
  function update<T extends TableNames<S>>(table: T, data: Partial<TableItem<S, T>>, where: QueryParams<S, T>['where']) {
    const key = getPrimaryKeyColumn(schema, table)

    const builder = db(table)
      .where(buildWhereQuery(schema, table, where))
      .update(data)
      .returning(key)

    return builder as knex.Knex.QueryBuilder<{}, TablePrimaryKeyValue<S, T>[]>
  }

  /**
   * Delete an item in a table.
   */
  function removeOne<T extends TableNames<S>>(table: T, pk: TablePrimaryKeyValue<S, T>) {
    const key = getPrimaryKeyColumn(schema, table)

    const builder = db(table)
      .delete()
      .where(key, '=', pk)
      .returning(key)

    return wrapSingleResult(builder) as knex.Knex.QueryBuilder<{}, TablePrimaryKeyValue<S, T>>
  }

  /**
   * Delete multiple items in a table.
   */
  function remove<T extends TableNames<S>>(table: T, where: QueryParams<S, T>['where']) {
    const key = getPrimaryKeyColumn(schema, table)

    const builder = db(table)
      .where(buildWhereQuery(schema, table, where))
      .delete()
      .returning(key)

    return builder as knex.Knex.QueryBuilder<{}, TablePrimaryKeyValue<S, T>[]>
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
