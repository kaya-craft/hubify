import { vi } from 'vitest'
import { createDatabaseInstance } from '../modules/schema/utils/database'

/**
 * Create a fake schema.
 */
export const schema = {
  hubify_users: {
    columns: {
      id: { type: 'increments', primaryKey: true },
      name: { type: 'text' },
      role: { type: 'integer', notNull: true }
    },
    relations: {
      role: { table: 'hubify_roles', fromKey: 'role', toKey: 'id' }
    }
  },
  hubify_roles: {
    columns: {
      id: { type: 'increments', primaryKey: true },
      name: { type: 'text' },
      admin: { type: 'boolean', notNull: true }
    },
    relations: {
      permissions: { table: 'hubify_permissions', fromKey: 'id', toKey: 'role_id', through: 'hubify_roles_permissions', throughKey: 'permission_id' }
    }
  },
  hubify_permissions: {
    columns: {
      id: { type: 'increments', primaryKey: true },
      name: { type: 'string', notNull: true }
    }
  },
  hubify_roles_permissions: {
    columns: {
      id: { type: 'increments', primaryKey: true },
      role_id: { type: 'integer', notNull: true },
      permission_id: { type: 'integer', notNull: true }
    },
    relations: {
      role_id: { table: 'hubify_roles', fromKey: 'role_id', toKey: 'id' },
      permission_id: { table: 'hubify_permissions', fromKey: 'permission_id', toKey: 'id' }
    }
  }
} as const

/**
 * Create a database instance.
 */
export const instance = createDatabaseInstance({
  client: 'better-sqlite3',
  connection: {
    filename: ':memory:'
  },
  useNullAsDefault: true
}, schema)

vi.mock('#hubify/schema', () => ({
  default: schema
}))
