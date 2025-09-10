import { vi } from 'vitest'
import { createDatabaseInstance } from '@hubify/api/lib/database/index'
import { defineCollection, withDefaults } from '../modules/schema/utils/collections'

/**
 * Create a fake schema.
 */
export const schema = {
  hubify_users: defineCollection({
    columns: withDefaults({
      name: { type: 'text' },
      role: { type: 'one-to-many', table: 'hubify_roles' }
    })
  }),
  hubify_roles: defineCollection({
    columns: withDefaults({
      name: { type: 'text' },
      admin: { type: 'boolean', nullable: false, default: false },
      permissions: { type: 'many-to-many', table: 'hubify_permissions', through: 'hubify_roles_permissions', throughKey: 'role_id' }
    })
  }),
  hubify_permissions: defineCollection({
    columns: withDefaults({
      name: { type: 'text' }
    })
  }),
  hubify_roles_permissions: defineCollection({
    columns: withDefaults({
      role_id: { type: 'one-to-many', table: 'hubify_roles' },
      permission_id: { type: 'one-to-many', table: 'hubify_permissions' }
    })
  })
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
