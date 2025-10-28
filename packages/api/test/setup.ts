import { vi } from 'vitest'
import { createDatabaseInstance } from '@hubify/api/database/index'
import { withDefaults, normalizeSchema } from '@hubify/api/collections'
import { defineCollection } from '@hubify/api/utils/collections'
/**
 * Create a fake schema.
 */
export const schema = normalizeSchema({
  hubify_users: defineCollection(withDefaults({
    name: { type: 'text' },
    role: { type: 'one-to-many', table: 'hubify_roles' }
  })),
  hubify_roles: defineCollection(withDefaults({
    name: { type: 'text' },
    admin: { type: 'boolean', nullable: false, default: false },
    permissions: { type: 'many-to-many', table: 'hubify_permissions', through: 'hubify_roles_permissions', throughKey: 'role_id' }
  })),
  hubify_permissions: defineCollection(withDefaults({
    name: { type: 'text' }
  })),
  hubify_roles_permissions: defineCollection(withDefaults({
    role_id: { type: 'one-to-many', table: 'hubify_roles' },
    permission_id: { type: 'one-to-many', table: 'hubify_permissions' }
  }))
})

/**
 * Create a database instance.
 */
export const instance = createDatabaseInstance({
  client: 'better-sqlite3',
  connection: {
    filename: ':memory:'
  }
}, schema)

vi.mock('#hubify/schema', () => ({
  default: schema
}))
