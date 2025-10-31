import { describe, expectTypeOf, it } from 'vitest'

describe('Types', () => {
  it('should have the right types for the table names', () => {
    expectTypeOf<TableNames>().toEqualTypeOf<'hubify_users' | 'hubify_roles' | 'hubify_settings' | 'hubify_collections' | 'hubify_credentials' | 'hubify_environment'>()
  })

  it('should have the right types for the column names', () => {
    expectTypeOf<TableColumnNames<'hubify_users'>>().toEqualTypeOf<'email' | 'password' | 'firstname' | 'lastname' | 'createdAt' | 'updatedAt' | 'id'>()
    expectTypeOf<TableColumnNames<'hubify_roles'>>().toEqualTypeOf<'name' | 'description' | 'icon' | 'admin' | 'createdAt' | 'updatedAt' | 'id'>()
    expectTypeOf<TableColumnNames<'hubify_settings'>>().toEqualTypeOf<'name' | 'description' | 'primaryColor' | 'logo' | 'createdAt' | 'updatedAt' | 'id'>()
    expectTypeOf<TableColumnNames<'hubify_collections'>>().toEqualTypeOf<'name' | 'description' | 'color' | 'displayTemplate' | 'icon' | 'singleton' | 'hidden' | 'createdAt' | 'updatedAt' | 'id'>()
    expectTypeOf<TableColumnNames<'hubify_credentials'>>().toEqualTypeOf<'publicKey' | 'counter' | 'backedUp' | 'transports' | 'createdAt' | 'updatedAt' | 'id'>()
    expectTypeOf<TableColumnNames<'hubify_environment'>>().toEqualTypeOf<'key' | 'value' | 'createdAt' | 'updatedAt' | 'id'>()
  })

  it('should have the right types for the relation names', () => {
    expectTypeOf<TableRelationNames<'hubify_users'>>().toEqualTypeOf<'role'>()
    expectTypeOf<TableRelationNames<'hubify_roles'>>().toEqualTypeOf<never>()
    expectTypeOf<TableRelationNames<'hubify_settings'>>().toEqualTypeOf<never>()
    expectTypeOf<TableRelationNames<'hubify_collections'>>().toEqualTypeOf<never>()
    expectTypeOf<TableRelationNames<'hubify_credentials'>>().toEqualTypeOf<'user'>()
    expectTypeOf<TableRelationNames<'hubify_environment'>>().toEqualTypeOf<never>()
  })

  it('should have the right types for the field names', () => {
    expectTypeOf<TableFieldNames<'hubify_users'>>().toEqualTypeOf<'email' | 'password' | 'firstname' | 'lastname' | 'createdAt' | 'updatedAt' | 'id' | 'role'>()
    expectTypeOf<TableFieldNames<'hubify_roles'>>().toEqualTypeOf<'name' | 'description' | 'icon' | 'admin' | 'createdAt' | 'updatedAt' | 'id'>()
    expectTypeOf<TableFieldNames<'hubify_settings'>>().toEqualTypeOf<'name' | 'description' | 'primaryColor' | 'logo' | 'createdAt' | 'updatedAt' | 'id'>()
    expectTypeOf<TableFieldNames<'hubify_collections'>>().toEqualTypeOf<'name' | 'description' | 'color' | 'displayTemplate' | 'icon' | 'singleton' | 'hidden' | 'createdAt' | 'updatedAt' | 'id'>()
    expectTypeOf<TableFieldNames<'hubify_credentials'>>().toEqualTypeOf<'publicKey' | 'counter' | 'backedUp' | 'transports' | 'createdAt' | 'updatedAt' | 'id' | 'user'>()
    expectTypeOf<TableFieldNames<'hubify_environment'>>().toEqualTypeOf<'key' | 'value' | 'createdAt' | 'updatedAt' | 'id'>()
  })

  it('should have the right types for the items', () => {
    expectTypeOf<TableItem<'hubify_users'>>().toEqualTypeOf<{
      email: string
      password: string
      firstname: string | null
      lastname: string | null
      createdAt: string | Date
      updatedAt: string | Date
      id: number
      role: number | TableItem<'hubify_roles'>
    }>()

    expectTypeOf<TableItem<'hubify_roles'>>().toEqualTypeOf<{
      name: string
      description: string | null
      icon: string
      admin: boolean
      createdAt: string | Date
      updatedAt: string | Date
      id: number
    }>()

    expectTypeOf<TableItem<'hubify_settings'>>().toEqualTypeOf<{
      name: string
      description: string | null
      primaryColor: string | null
      logo: string | null
      createdAt: string | Date
      updatedAt: string | Date
      id: number
    }>()

    expectTypeOf<TableItem<'hubify_collections'>>().toEqualTypeOf<{
      name: string
      description: string | null
      color: string | null
      displayTemplate: string | null
      icon: string | null
      singleton: boolean
      hidden: boolean
      createdAt: string | Date
      updatedAt: string | Date
      id: number
    }>()

    expectTypeOf<TableItem<'hubify_credentials'>>().toEqualTypeOf<{
      publicKey: string
      counter: number
      backedUp: boolean
      transports: string
      createdAt: string | Date
      updatedAt: string | Date
      id: number
      user: number | TableItem<'hubify_users'>
    }>()

    expectTypeOf<TableItem<'hubify_environment'>>().toEqualTypeOf<{
      key: string
      value: string | null
      createdAt: string | Date
      updatedAt: string | Date
      id: number
    }>()
  })
})
