import { defineCollection, withDefaults } from '#hubify'

/**
 * Migration for creating the `hubify_users` table.
 */

export default defineCollection({
  fields: withDefaults({
    email: {
      type: 'varchar',
      unique: true
    },
    password: {
      type: 'varchar'
    },
    firstname: {
      type: 'varchar',
      nullable: true
    },
    lastname: {
      type: 'varchar',
      nullable: true
    },
    role: {
      type: 'one-to-many',
      table: 'hubify_roles',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      nullable: true
    }
  })
})
