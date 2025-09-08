import { describe, expect, it, vi } from 'vitest'
import { createDatabaseInstance } from './index'

const schema = {
  hubify_users: {
    columns: {
      id: { type: 'increments', primaryKey: true },
      role: { type: 'integer', notNull: true }
    },
    relations: {
      role: { table: 'hubify_roles', fromKey: 'role', toKey: 'id' }
    }
  },
  hubify_roles: {
    columns: {
      id: { type: 'increments', primaryKey: true },
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

vi.mock('#hubify/schema', () => ({
  default: schema
}))

describe('database', () => {
  const instance = createDatabaseInstance({
    client: 'better-sqlite3',
    connection: {
      filename: ':memory:'
    },
    useNullAsDefault: true
  }, schema)

  it('should create a database instance', () => {
    expect(instance).toBeDefined()
  })

  it('should run correct find query', async () => {
    const query = instance.find('hubify_users', {
      columns: ['id', 'role.admin', 'role.permissions.name'],
      where: {
        'role.id': {
          $eq: 1
        },
        '$and': [{
          'role.permissions.name': {
            $contains: 'manage'
          },
          'role.admin': {
            $eq: true
          }
        }],
        '$or': [{
          'role.id': {
            $lt: 10
          }
        }, {
          'role.id': {
            $gt: 20
          }
        }]
      },
      orderBy: ['-id', 'role.admin'],
      groupBy: ['role.id'],
      limit: 10,
      offset: 20
    }).toQuery()

    expect(query).toBe('select `hubify_users`.`id`, `hubify_roles`.`admin`, `hubify_permissions`.`name` from `hubify_users` left join `hubify_roles` on `hubify_users`.`role` = `hubify_roles`.`id` left join `hubify_roles_permissions` on `hubify_roles`.`id` = `hubify_roles_permissions`.`role_id` left join `hubify_permissions` on `hubify_roles_permissions`.`permission_id` = `hubify_permissions`.`id` where (`hubify_roles`.`id` = 1 and ((`hubify_permissions`.`name` like \'%manage%\' and `hubify_roles`.`admin` = true)) and ((`hubify_roles`.`id` < 10) or (`hubify_roles`.`id` > 20))) group by `hubify_roles`.`id` order by `hubify_users`.`id` desc, `hubify_roles`.`admin` asc limit 10 offset 20')
  })

  it('should run correct findOne query', async () => {
    const query = instance.findOne('hubify_users', 1, {
      columns: ['id', 'role.admin', 'role.permissions.name']
    }).toQuery()

    expect(query).toBe('select `hubify_users`.`id`, `hubify_roles`.`admin`, `hubify_permissions`.`name` from `hubify_users` left join `hubify_roles` on `hubify_users`.`role` = `hubify_roles`.`id` left join `hubify_roles_permissions` on `hubify_roles`.`id` = `hubify_roles_permissions`.`role_id` left join `hubify_permissions` on `hubify_roles_permissions`.`permission_id` = `hubify_permissions`.`id` where `id` = 1 limit 1')
  })

  it('should run correct create query', async () => {
    const query = instance.createOne('hubify_users', { id: 1, role: 2 }).toQuery()

    expect(query).toBe('insert into `hubify_users` (`id`, `role`) values (1, 2) returning `id`')
  })

  it('should run correct updateOne query', async () => {
    const query = instance.updateOne('hubify_users', 1, { role: 2 }).toQuery()

    expect(query).toBe('update `hubify_users` set `role` = 2 where `id` = 1 returning `id`')
  })

  it('should run correct update query', async () => {
    const query = instance.update('hubify_users', { role: 2 }, {
      role: {
        $eq: 1
      }
    }).toQuery()

    expect(query).toBe('update `hubify_users` set `role` = 2 where (`hubify_users`.`role` = 1) returning `id`')
  })

  it('should run correct removeOne query', async () => {
    const query = instance.removeOne('hubify_users', 1).toQuery()

    expect(query).toBe('delete from `hubify_users` where `id` = 1')
  })

  it('should run correct remove query', async () => {
    const query = instance.remove('hubify_users', {
      role: {
        $eq: 1
      }
    }).toQuery()

    expect(query).toBe('delete from `hubify_users` where (`hubify_users`.`role` = 1)')
  })
})
