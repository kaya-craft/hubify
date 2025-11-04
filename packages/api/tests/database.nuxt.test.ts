import { describe, expect, it } from 'vitest'
import { instance } from './setup'
import { getCurrentSchema, runMigrations, shouldSkipColumnComparison } from '@hubify/api/database/migration'
import schema from '#hubify/schema'
import { normalizeSchema } from '@hubify/api/collections'
import type { Schema, TableDefinition } from '@hubify/api/database/types'

describe('database', () => {
  it('should write correct find query', async () => {
    const query = instance.find('hubify_users', {
      fields: ['id', 'role.admin', 'role.policies.permissions.name'],
      where: {
        role: {
          $eq: 1
        },
        $and: [{
          'role.policies.permissions.name': {
            $contains: 'read'
          },
          'role.admin': {
            $eq: true
          }
        }],
        $or: [{
          role: {
            $lt: 10
          }
        }, {
          role: {
            $gt: 20
          }
        }]
      },
      orderBy: ['-id', 'role.admin'],
      groupBy: ['role.id'],
      limit: 10,
      offset: 20
    }).toQuery()

    expect(query).toBe('select `hubify_users`.`id`, `hubify_roles`.`admin`, `hubify_permissions`.`name` from `hubify_users` left join `hubify_roles` on `hubify_users`.`role` = `hubify_roles`.`id` left join `hubify_policies_roles` on `hubify_roles`.`id` = `hubify_policies_roles`.`role` left join `hubify_policies` on `hubify_policies_roles`.`policy` = `hubify_policies`.`id` left join `hubify_policies_permissions` on `hubify_policies`.`id` = `hubify_policies_permissions`.`policy` left join `hubify_permissions` on `hubify_policies_permissions`.`permission` = `hubify_permissions`.`id` where (`hubify_users`.`role` = 1 and ((`hubify_permissions`.`name` like \'%read%\' and `hubify_roles`.`admin` = true)) and ((`hubify_users`.`role` < 10) or (`hubify_users`.`role` > 20))) group by `hubify_roles`.`id` order by `hubify_users`.`id` desc, `hubify_roles`.`admin` asc limit 10 offset 20')
  })

  it('should write correct findOne query', async () => {
    const query = instance.findOne('hubify_users', 1, {
      fields: ['id', 'role.admin', 'role.policies.permissions.name']
    }).toQuery()

    expect(query).toBe('select `hubify_users`.`id`, `hubify_roles`.`admin`, `hubify_permissions`.`name` from `hubify_users` left join `hubify_roles` on `hubify_users`.`role` = `hubify_roles`.`id` left join `hubify_policies_roles` on `hubify_roles`.`id` = `hubify_policies_roles`.`role` left join `hubify_policies` on `hubify_policies_roles`.`policy` = `hubify_policies`.`id` left join `hubify_policies_permissions` on `hubify_policies`.`id` = `hubify_policies_permissions`.`policy` left join `hubify_permissions` on `hubify_policies_permissions`.`permission` = `hubify_permissions`.`id` where `id` = 1 limit 1')
  })

  it('should write correct create query', async () => {
    const query = instance.createOne('hubify_users', { id: 1, role: 2 }).toQuery()

    expect(query).toBe('insert into `hubify_users` (`id`, `role`) values (1, 2) returning *')
  })

  it('should write correct updateOne query', async () => {
    const query = instance.updateOne('hubify_users', 1, { role: 2 }).toQuery()

    expect(query).toBe('update `hubify_users` set `role` = 2 where `id` = 1 returning `id`')
  })

  it('should write correct update query', async () => {
    const query = instance.update('hubify_users', { role: 2 }, {
      role: {
        $eq: 1
      }
    }).toQuery()

    expect(query).toBe('update `hubify_users` set `role` = 2 where (`hubify_users`.`role` = 1) returning `id`')
  })

  it('should write correct removeOne query', async () => {
    const query = instance.removeOne('hubify_users', 1).toQuery()

    expect(query).toBe('delete from `hubify_users` where `id` = 1')
  })

  it('should write correct remove query', async () => {
    const query = instance.remove('hubify_users', {
      role: {
        $eq: 1
      }
    }).toQuery()

    expect(query).toBe('delete from `hubify_users` where (`hubify_users`.`role` = 1)')
  })

  it ('should run migrations correctly', async () => {
    const migrations = await runMigrations(instance.db, schema)
    expect(migrations).toBe(10)

    expect(await instance.getTableNames()).toEqual(expect.arrayContaining([
      'hubify_users',
      'hubify_roles',
      'hubify_permissions',
      'hubify_policies_roles',
      'hubify_policies',
      'hubify_policies_permissions'
    ]))

    const newSchema = normalizeSchema({
      ...schema,
      hubify_profiles: {
        id: {
          type: 'integer',
          primary: true,
          autoIncrement: true
        },
        bio: {
          type: 'text',
          nullable: true
        },
        user: {
          type: 'one-to-many',
          table: 'hubify_users'
        }
      }
    })

    const newMigrations = await runMigrations(instance.db, newSchema)
    expect(newMigrations).toBe(1)

    expect(await instance.getTableNames()).toEqual(expect.arrayContaining([
      'hubify_users',
      'hubify_roles',
      'hubify_permissions',
      'hubify_policies_roles',
      'hubify_policies',
      'hubify_policies_permissions',
      'hubify_profiles'
    ]))

    const currentSchema = await getCurrentSchema(instance.db)

    expect(cleanSchema(currentSchema)).toEqual(cleanSchema(newSchema))
  })
})

// Remove the default values as they won't match the ones returned by getCurrentSchema
// e.g. '{CURRENT_TIMESTAMP}' becomes 'CURRENT_TIMESTAMP'
// Also remove many-to-many relations as they are not represented in the database schema
function cleanSchema<T extends Schema>(schema: T) {
  const entries = Object.entries(schema) as [string, TableDefinition][]

  return Object.fromEntries(entries.map(([tableName, tableDef]) => [
    tableName,
    Object.fromEntries(Object.entries(tableDef).filter(([name, fieldDef]) => {
      // TODO/FIXME: Remove this when we have proper many-to-many support in migrations
      return !shouldSkipColumnComparison(fieldDef) && name !== 'action'
    }).map(([fieldName, fieldDef]) => [
      fieldName,
      fieldDef
    ]))
  ])) as unknown as T
}
