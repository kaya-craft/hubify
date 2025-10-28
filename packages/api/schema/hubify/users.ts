import { withDefaults } from '@hubify/api/collections'

/**
 * Migration for creating the `hubify_users` table.
 */

export default defineCollection(withDefaults({
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
    type: 'many-to-one',
    table: 'hubify_roles',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true
  }
}))
