import type { CreateOneRawFn, FindOneRawFn, FindRawFn, RemoveOneRawFn, RemoveRawFn, UpdateOneRawFn, UpdateRawFn } from './queries'
import type { ColumnTypes, RelationOnAction, Schema } from '@/types/schema'
import type { Database } from 'db0'
import { createDatabase } from 'db0'
import connector from 'db0/connectors/node-sqlite'
import { defineDriver } from '@/index'
import { createOneRaw, findOneRaw, findRaw, removeOneRaw, removeRaw, schemaRaw, updateOneRaw, updateRaw } from './queries'
import { createTable, dropTable, updateTable } from '@/utils/statements'
import { getSchemaDiff } from '@/utils/helpers'

export default defineDriver(<S extends Schema>(schema: S) => ({
  findRaw: findRaw(schema) as FindRawFn<S>,
  findOneRaw: findOneRaw(schema) as FindOneRawFn<S>,
  updateRaw: updateRaw(schema) as UpdateRawFn<S>,
  updateOneRaw: updateOneRaw(schema) as UpdateOneRawFn<S>,
  createOneRaw: createOneRaw(schema) as CreateOneRawFn<S>,
  removeOneRaw: removeOneRaw(schema) as RemoveOneRawFn<S>,
  removeRaw: removeRaw(schema) as RemoveRawFn<S>,
  runTransaction,
  retrieveSchema,
  updateSchema,
  createTableRaw: createTable,
  updateTableRaw: updateTable,
  dropTableRaw: dropTable
}), () => createDatabase(connector({ cwd: process.cwd() })))

/**
 * Update the SQLite database schema.
 */
export async function updateSchema(db: Database, newSchema: Schema) {
  const current = await retrieveSchema(db)
  const diff = getSchemaDiff(current, newSchema)

  return runTransaction(db, async () => {
    await Promise.all([
      ...Object.entries(diff.added || {}).map(([table, def]) => db.exec(createTable(table, def))),
      ...Object.entries(diff.updated || {}).map(([table, def]) => db.exec(updateTable(table, def))),
      ...Object.entries(diff.removed || {}).map(([table]) => db.exec(dropTable(table)))
    ])
  })
}

/**
 * Retrieve the Sqlite database schema.
 */
export async function retrieveSchema(db: Database) {
  const query = schemaRaw()
  const { rows } = await db.sql<{ rows: SchemaRow[] }>`{${query}}`
  const schema: Schema = {}

  for (const row of rows) {
    const current = schema[row.table] ??= { columns: {} }

    current.columns[row.column] = {
      type: row.type,
      notNull: row.notNull === 1,
      default: row.default || undefined,
      primaryKey: row.primaryKey === 1,
      unique: row.primaryKey === 1 ? undefined : row.unique === 1
    }

    if (!row.relationTable) continue

    current.relations ??= {}

    current.relations[row.column] = {
      table: row.relationTable,
      fromKey: row.relationFrom,
      toKey: row.relationTo,
      onDelete: row.relationOnDelete || 'NO ACTION',
      onUpdate: row.relationOnUpdate || 'NO ACTION'
    }
  }

  return schema
}

/**
 * Run a transaction.
 */
export async function runTransaction<T>(db: Database, cb: () => Promise<T>) {
  await db.exec(`BEGIN TRANSACTION`)
  try {
    await cb()
    await db.exec(`COMMIT`)
  }
  catch (error) {
    await db.exec(`ROLLBACK`)
    throw error
  }
}

export type SchemaRow = {
  table: string
  column: string
  type: ColumnTypes
  notNull?: number
  default?: string | null
  primaryKey?: number
  unique?: number
  relationTable: string
  relationFrom: string
  relationTo: string
  relationOnUpdate?: RelationOnAction
  relationOnDelete?: RelationOnAction
}
