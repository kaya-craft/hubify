import { createDatabaseInstance } from '@hubify/api/database/index'
import schema from '#hubify/schema'

/**
 * Create a database instance.
 */
export const instance = createDatabaseInstance({
  client: 'better-sqlite3',
  connection: {
    filename: ':memory:'
  }
}, schema)
