import { withDefaults } from '@hubify/api/collections'

/**
 * Migration for creating the `hubify_roles` table.
 */
export default defineCollection(withDefaults({
  name: {
    type: 'varchar'
  },
  description: {
    type: 'text',
    nullable: true
  },
  icon: {
    type: 'varchar',
    default: 'heroicons:shield-check'
  },
  admin: {
    type: 'boolean',
    default: false
  },
  policies: {
    type: 'many-to-many',
    table: 'hubify_policies',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    through: 'hubify_policies_roles',
    throughKey: 'role'
  }
}))
