import type { Knex } from 'knex'

/**
 * Define a table schema.
 */
export function defineTable(cb: (table: Knex.CreateTableBuilder, knex: Knex) => void) {
  return cb
}
