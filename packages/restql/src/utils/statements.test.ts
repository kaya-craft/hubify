import { describe, expect, expectTypeOf, it } from 'vitest'
import { createTable, updateTable } from './statements'
import { defineTable } from '..'
import { getSchemaDiff } from './helpers'

describe('Statements', () => {
  it('should create a table with the correct SQL statement', () => {
    const tableName = 'users'

    const definition = defineTable({
      columns: {
        id: { type: 'int8', notNull: true, primaryKey: true },
        name: { type: 'text', notNull: true },
        email: { type: 'text', notNull: true, unique: true },
        group: { type: 'text' }
      },
      relations: {
        group: {
          table: 'groups',
          fromKey: 'group',
          toKey: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      }
    })

    const sql = createTable(tableName, definition)

    expect(sql).toBe(`CREATE TABLE IF NOT EXISTS users (id INT8 PRIMARY KEY NOT NULL, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, group TEXT REFERENCES groups(id) ON DELETE CASCADE ON UPDATE CASCADE)`)

    expectTypeOf(sql).toEqualTypeOf<`CREATE TABLE IF NOT EXISTS users (id INT8 PRIMARY KEY NOT NULL, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, group TEXT REFERENCES groups(id) ON DELETE CASCADE ON UPDATE CASCADE)`>()
  })

  it('should update a table with the correct SQL statement', () => {
    const tableName = 'users'

    const original = defineTable({
      columns: {
        id: { type: 'int8', notNull: true, primaryKey: true },
        name: { type: 'text', notNull: true },
        email: { type: 'text', notNull: true, unique: true },
        group: { type: 'text' }
      },
      relations: {
        group: {
          table: 'groups',
          fromKey: 'group',
          toKey: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      }
    })

    const newSchema = defineTable({
      columns: {
        id: { type: 'uuid', primaryKey: true },
        name: { type: 'text', notNull: true },
        email: { type: 'text', notNull: false, unique: true },
        group: { type: 'text', notNull: true },
        extra: { type: 'json' }
      },
      relations: {
        group: {
          table: 'groups',
          fromKey: 'group',
          toKey: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      }
    })

    const diff = getSchemaDiff({
      [tableName]: original
    }, {
      [tableName]: newSchema
    })

    const sql = updateTable(tableName, diff.updated[tableName])

    expect(sql).toBe('ALTER TABLE users ADD COLUMN extra JSON; ALTER TABLE users DROP COLUMN id; ALTER TABLE users ADD COLUMN id UUID PRIMARY KEY; ALTER TABLE users DROP COLUMN email; ALTER TABLE users ADD COLUMN email TEXT UNIQUE; ALTER TABLE users DROP COLUMN group; ALTER TABLE users ADD COLUMN group TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE ON UPDATE CASCADE')
  })
})
