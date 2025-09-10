import { defineCollection, withDefaults } from '#hubify'

/**
 * Migration for creating the `hubify_users` table.
 */

export default defineCollection({
  columns: withDefaults({
    email: {
      type: 'string',
      unique: true
    },
    password: {
      type: 'string'
    },
    firstname: {
      type: 'string',
      nullable: true
    },
    lastname: {
      type: 'string',
      nullable: true
    },
    role: {
      type: 'many-to-one',
      table: 'hubify_roles',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      nullable: true
    }
  })
})
